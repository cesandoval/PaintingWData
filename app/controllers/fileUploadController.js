var fileUploadHelper = require('../../lib/fileUploadHelper');  

var User = require('../models').User,
    gdal = require("gdal"),
    shapefile = require('shapefile'),
    Models = require('../models'),
    path = require('path'),
    fs = require('fs'),
    formidable = require('formidable'),
    request = require('request');

module.exports.show = function(req, res) {
    res.render('upload', {userSignedIn: req.isAuthenticated(), user: req.user});
}

module.exports.upload = function(req, res) {
  // TODO: Add spatial index

  var form = new formidable.IncomingForm(); 
  var files = [];
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
    fs.rename(file.path, path.join(form.uploadDir, file.name), function(err){
     if(err){
       console.log("something went wrong! " + err);
     }
     else{
      fileUploadHelper.ExtractZip(path.join(path.dirname(file.path), file.name), function(err, target_path){
        if(err){
          console.log("Error: ", err);
          
        }
        else{
          fileUploadHelper.VerifyFiles(target_path, function(err, target_path){
            if(err){
                console.log("Error: ", err);
                res.redirect(200, '..');
            }
            else{
            fileUploadHelper.GetShapeFiles(target_path, function(err, shapeFiles){
              if(err){
                console.log("Error: ", err);
              }
              else{
                fileUploadHelper.GetEPSG(target_path, function(err, epsg, bbox, centroid){
                  console.log(bbox, centroid);
                  var dataFile = Models.Datafile.build();
                  dataFile.userId = req.user.id;
                  dataFile.location = target_path;
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
    
  });

  // parse the incoming request containing the form data
  form.parse(req)
   
}
