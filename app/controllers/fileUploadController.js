var fileUploadHelper = require('../../lib/fileUploadHelper'),
    Models = require('../models'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable');
    fs_extra = require('fs-extra')
    getSize = require('get-folder-size');

/**
 * Displays upload.jade for /upload page
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.show = function(req, res) {
    res.render('upload', {userSignedIn: req.isAuthenticated(), user: req.user, uploadAlert: req.flash('uploadAlert')[0]});
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

      req.flash('uploadAlert', 'Error while uploading file: \n' + err);
      res.status(400).send({
        message: 'Errors with the upload.'
      });
    });

    // once all the files have been uploaded, send a response to the client
    form.on('end', function() {
      var file = files[0];
      if("undefined" !== typeof file) {
        fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
        if(err){
          console.log("something went wrong! " + err);

          req.flash('uploadAlert', "Error unzipping. Upload a Different File.");
          res.status(400).send({
            message: 'Errors with the upload.'
          });
        }
        else{
          var zipDir = path.join(path.dirname(file.path), file.name);
          // Extract a zipfile and return a path where it was extacted, trigger errors if file formats are messed up.
          fileUploadHelper.extractZip(zipDir, function(err, targetName, targetPath){
            if(err){
              console.log("Error 1: ", err);

              req.flash('uploadAlert', "Error with the File Format. Upload a Different File.");
              res.status(400).send({
                message: 'Errors with the upload.'
              });
            }
            else{
              // Check if the zip file contains all the extensions
              fileUploadHelper.verifyFiles(targetPath, function(err, targetPath){
                if(err){
                    //if file is messed up, file doesn't contain one of the extensions required
                    console.log("Error 2: ", err);

                    req.flash('uploadAlert', "Error with your upload, it might be missing some required files. Upload a Different File.");
                    res.status(400).send({
                      message: 'Errors with the upload.'
                    });
                }
                else{
                  fileUploadHelper.getShapeFiles(targetPath, function(err, shapeFiles){
                    if(err){
                      // geometry is messed up

                      req.flash('uploadAlert', "Problems with geometry.. Upload a Different File.");
                      res.status(400).send({
                        message: 'Errors with the upload.'
                      });
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
                          // Creates a new model of Datafile
                          var dataFile = Models.Datafile.build();
                          console.log("This increments up by 1. It is now: " + dataFile.id);
                          dataFile.userId = req.user.id;
                          dataFile.location = targetPath;
                          dataFile.filename = shapeFiles[0];
                          dataFile.epsg = epsg;
                          dataFile.centroid = centroid;
                          dataFile.bbox = bbox;
                          dataFile.geometryType = geomType;
                          // Saves the function and sends a route for the uploadViewer to parse
                          dataFile.save().then(function(d){
                            res.send({id: d.id+'$$'+size});
                          });
                        });
                      });
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
