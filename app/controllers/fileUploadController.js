var fileUploadHelper = require('../../lib/fileUploadHelper'),
    Model = require('../models'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    fs_extra = require('fs-extra'),
    processShapes = require('../../worker/worker2').processShapes,
    getSize = require('get-folder-size'),
    express = require('express'),
    queue = require('../../worker/worker2').queue,
    pushShapes = require('../../worker/fileProcessor').pushShapes,
    pushJSON = require('../../worker/fileProcessor').pushJSON;

/**
 * Displays upload.jade for /upload page
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.show = function(req, res) {
    res.render('upload', {userSignedIn: req.isAuthenticated(), user: req.user, uploadAlert: req.flash('uploadAlert')[0]});
}

function saveDatafileDatalayer(req, res, data){
  // Creates a new model of Datafile
  var dataFile = Model.Datafile.build();
  dataFile.userId = req.user.id;
  dataFile.location = data.targetPath;
  dataFile.description = data.fields['dataset_desc'];
  dataFile.public = data.fields['dataset_public'];
  dataFile.userFileName = data.fields['dataset_name'];
  dataFile.description = data.fields['dataset_desc'];

  if (!data.json) {
    dataFile.filename = data.shapeFiles[0]
    dataFile.epsg = data.epsg
    dataFile.centroid = data.centroid
    dataFile.bbox = data.bbox
    dataFile.geometryType = data.geomType;
  } else {
    // TODO: centroid, bbox, geometryType
    dataFile.filename = data.fields['dataset_name']
    dataFile.epsg = 4326
  }

  // Saves the function and sends a route for the uploadViewer to parse
  dataFile.save().then(function(d){
    console.log("This increments up by 1. It is now: " + d.id);
    var datafileId = d.id

    if (data.fields['dataset_tags'].length >0) {
      var tags = data.fields['dataset_tags'].split(',');
      var tagObjs = []
      for (let tag in tags) {
        tagObjs.push({tag: tags[tag], datafileId: datafileId})
      }
    } else {
      var tagObjs = []
    }

    // Save the tags to the Datafiletag model
    Model.Datafiletag.bulkCreate(tagObjs).then(() =>{
      if (!data.json) {
        var newReq = {
          body: {
              rasterProperty: '',
              datafileId : datafileId,
              layername: data.fields['dataset_name'],
              location : '',
              epsg: '4326', 
          },
          user: {
              id: req.user.id
          }
        }
      } else {
        var newReq = {
          body: {
            datafileId : datafileId,
            layername: data.fields['dataset_name'],
            filename: data.fields['dataset_name'],
            targetPath: data.targetPath,
          },
          user: {id: req.user.id}
        }
      }

      var app = express()

      Model.User.findById(newReq.user.id).then(function(user) {
          // Send user an email
          var uploadsSize = parseFloat(user.uploadsSize);
          var newUploadsSize = uploadsSize + parseFloat(data.size);
          console.log('The user has uploaded a total of ' + newUploadsSize + ' mbs')
  
          // If not running on production mode, then ignore any upload size warnings
          if (app.get('env') !== 'production') {
              console.log(app.get('env'))
              newUploadsSize = 0;
          }
  
          // If User has uploaded more than 100, then do not allow if the it is not a Premium Account
          var UPLOAD_LIMIT = 100;
          if (newUploadsSize <= UPLOAD_LIMIT || user.paidUser) {
              user.update({
                  uploadsSize: uploadsSize + parseFloat(data.size)
              }).then(function() {
                  if (!data.json) {
                    // Sends a process to a worker
                    var job = queue.create('saveLayer', newReq)
                        .priority('critical')
                        .attempts(2)
                        .backoff(true)
                        .removeOnComplete(true)
                        .save((err) => {
                          if (err) {
                            // console.log(util.inspect(data))
                            // console.log(done)
                            console.error(err);
                            console.log(err);
                          }
                          if (!err) {
                            console.log('Shapes added to the queue');
                          }
                        });
                    job.on('complete', function(){
                      console.log('job completed!!!!')
                      res.json({completed: true}); 
                    });
                    
                    queue.process('saveLayer', 5, (job, done) => { 
                      var data = job.data;
                      var req = data;
                      // var res = data[1];
                      // console.log(data)
                      // console.log(JSON.parse(data))
                      pushShapes(req, function (message) {
                        console.log(message, '-----------------');
                        done();
                      });
                    });
                  } else {
                    // Sends a process to a worker
                    var job = queue.create('saveJSON', newReq)
                        .priority('critical')
                        .attempts(1)
                        .backoff(true)
                        .removeOnComplete(true)
                        .save((err) => {
                          if (err) {
                            // console.log(util.inspect(data))
                            // console.log(done)
                            console.error(err);
                            console.log(err);
                          }
                          if (!err) {
                            console.log('Shapes added to the queue');
                          }
                        });
                    job.on('complete', function(result){
                      console.log(result)
                      console.log('job completed!!!!')
                      res.json({completed: true}); 
                    });
                    job.on('error', function(err){
                      console.log(err)
                      res.json({
                        completed:false,
                        alert:"The coordinate reference system is not WGS84.",
                        alertType:"uploadAlert",
                      });
                      return

                    })
                    
                    queue.process('saveJSON', 5, (job, done) => { 
                      var req = job.data;
                      pushJSON(req, function (message) {
                        if (typeof message.message !== "undefined") {
                          // res.json({
                          //   completed:false,
                          //   alert:"The coordinate reference system is not WGS84.",
                          //   alertType:"uploadAlert",
                          // });
                          done(new Error(message.message))
                        }
                        done();
                      });
                    });
                  }
              })
          } else {
              res.json({
                        completed:false,
                        alert:"Your account has reached the upload storage limit. Check back soon to sign up for a Premium Account.",
                        alertType:"accountAlert",
                      });
              //req.flash('accountAlert', "Your account has reached the upload storage limit. Check back soon to sign up for a Premium Account");
          }
      })
    })                       
  });
}

/**
 * Handles uploading zip files to the Datafiles database
 * @param {Object} req 
 * @param {Object} res 
 * @param {*} next 
 */
module.exports.upload = function(req, res, next) {
  var form = new formidable.IncomingForm();
  var files = [];
  fs.mkdir(path.join(__dirname, `/tmp`), function(err){
    form.uploadDir = path.join(__dirname, '/tmp');
    var shapefiles = [];
    form.on('file', function(field, file) {
      files.push(file);
    });
    form.on('error', function(err) {
      console.log('Error while uploading file: \n' + err);

      res.json({
        completed:false,
        alert:'Error while uploading file: \n' + err,
        alertType:"uploadAlert",
      });

      // req.flash('uploadAlert', 'Error while uploading file: \n' + err);
      // res.status(400).send({
      //   message: 'Errors with the upload.'
      // });
    });
    
    var fields = {}
    form.on('field', function(name, value) {
      fields[name] = value
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      var file = files[0];
      if("undefined" !== typeof file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
        if(err){
          console.log("something went wrong! " + err);

          res.json({
            completed:false,
            alert:"Error unzipping. Upload a Different File.",
            alertType:"uploadAlert",
          });

          // req.flash('uploadAlert', "Error unzipping. Upload a Different File.");
          // res.status(400).send({
          //   message: 'Errors with the upload.'
          // });
        }
        else{
          var zipDir = path.join(path.dirname(file.path), file.name);

          // Check if file is a JSON, a geoJSON, or a zipfile
          if (file.name.endsWith('.json') || file.name.endsWith('.geojson')) {
            var stats = fs.statSync(zipDir)
            var fileSizeInBytes = stats["size"]
            //Convert the file size to megabytes (optional)
            var size = fileSizeInBytes / 1000000.0

            let data = {
              fields: fields, 
              size: size,
              targetPath: zipDir, 
              json: true
            }

            saveDatafileDatalayer(req, res, data)
          } else if (file.name.endsWith('.zip')) {
            // Extract a zipfile and return a path where it was extacted, trigger errors if file formats are messed up.
            fileUploadHelper.extractZip(zipDir, function(err, targetName, targetPath){
              if(err){
                console.log("Error 1: ", err);

                res.json({
                  completed:false,
                  alert:"Error with the File Format. Upload a Different File.",
                  alertType:"uploadAlert",
                });

                // req.flash('uploadAlert', "Error with the File Format. Upload a Different File.");
                // res.status(400).send({
                //   message: 'Errors with the upload.'
                // });
              }
              else{
                // Check if the zip file contains all the extensions
                fileUploadHelper.verifyFiles(targetPath, function(err, targetPath){
                  if(err){
                      //if file is messed up, file doesn't contain one of the extensions required
                      console.log("Error 2: ", err);

                      res.json({
                        completed:false,
                        alert:"Error with your upload, it might be missing some required files. Upload a Different File.",
                        alertType:"uploadAlert",
                      });

                      // req.flash('uploadAlert', "Error with your upload, it might be missing some required files. Upload a Different File.");
                      // res.status(400).send({
                      //   message: 'Errors with the upload.'
                      // });
                  }
                  else{
                    fileUploadHelper.getShapeFiles(targetPath, function(err, shapeFiles){
                      if(err){
                        // geometry is messed up
                        res.json({
                          completed:false,
                          alert:"Problems with geometry.. Upload a Different File.",
                          alertType:"uploadAlert",
                        });

                        //req.flash('uploadAlert', "Problems with geometry.. Upload a Different File.");
                        // res.status(400).send({
                        //   message: 'Errors with the upload.'
                        // });
                      }
                      else{
                        // returns the size of the extracted file
                        getSize(targetPath, function(err, size) {
                          if (err) { 
                            console.log('File Sie Error:', err)
                            throw err; }
                          var size = (size / 1024 / 1024).toFixed(2);
                          var size = '' + size;
                          // uses the GDAL library to obtain a layer name, an EPSG code, a centroid, a bbox, and the geometry type
                          fileUploadHelper.getEPSG(targetPath, function(err, epsg, bbox, centroid, geomType){
                            let data = {
                              fields: fields, 
                              shapeFiles: shapeFiles, 
                              geomType: geomType, 
                              size: size, 
                              targetPath: targetPath, 
                              epsg: epsg, 
                              centroid: centroid, 
                              bbox: bbox,
                              json: false
                            }
                            saveDatafileDatalayer(req, res, data)
                          });
                        });
                      }
                    });
                  }})
                }
              });
            }
          }
        });
      };
    });

    // parse the incoming request containing the form data
    form.parse(req)

  });


}
