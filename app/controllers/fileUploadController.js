var fileUploadHelper = require('../../lib/fileUploadHelper'), 
    Models = require('../models'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable');
    fs_extra = require('fs-extra')

module.exports.show = function(req, res) {
    res.render('upload', {userSignedIn: req.isAuthenticated(), user: req.user});
}

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
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      var file = files[0];
      var whitelist = [];
      if("undefined" !== typeof file.path) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
        if(err){
          console.log("something went wrong! " + err);
        }//
        else{
          var zipDir = path.join(path.dirname(file.path), file.name);
          fileUploadHelper.extractZip(zipDir, function(err, targetName, targetPath){
            if(err){
              console.log("Error: ", err);
              req.flash('message',"Email is already in use.")
              res.status(400).send({
                message: 'Error with the File Format. Upload a Different File.'
              });

              // error with file formqt

              
            }
            else{
              fileUploadHelper.verifyFiles(targetPath, function(err, targetPath){
                if(err){
                    //if file is messed up, file doesn't contain one of the extensions required 
                    console.log(8888888)
                    console.log("Error: ", err);
                    res.redirect(200, '..');
                }
                else{
                fileUploadHelper.getShapeFiles(targetPath, function(err, shapeFiles){
                  if(err){
                    // geometry is messed up
                    console.log(7777777)
                    console.log("Error: ", err);
                  }
                  else{
                    fileUploadHelper.getEPSG(targetPath, function(err, epsg, bbox, centroid){
                      var dataFile = Models.Datafile.build();
                      dataFile.userId = req.user.id;
                      dataFile.location = targetPath;
                      dataFile.filename = shapeFiles[0];
                      dataFile.epsg = epsg;
                      dataFile.centroid = centroid;
                      dataFile.bbox = bbox;
                      dataFile.save().then(function(d){
                        res.send({id : d.id});
                      });
                    })  
                  }
                });
              }})
            }
          });
        }
      });
    };
      
    });

    // parse the incoming request containing the form data
    form.parse(req)
  });
  
   
}
