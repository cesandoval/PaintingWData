var User = require('../models').User,
    gdal = require("gdal"),
    shapefile = require('shapefile'),
    Models = require('../models'),
    path = require('path'),
    async = require('async'),
    fs = require('fs'),
    ncp = require('ncp'),
    exec = require('child_process').exec,
    formidable = require('formidable'),
    extract = require('extract-zip'),
    request = require('request'),
    fileViewer = require('./fileViewerController.js');
module.exports.show = function(req, res) {
    res.render('upload');
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
      extractZip(path.join(path.dirname(file.path), file.name), function(err, target_path){
        if(err){
          console.log("Error: ", err);
        }
        else{
          verifyFiles(target_path, whitelist, function(areRightFileTypes){
            getShapeFiles(target_path, function(err, shapeFiles){
              if(err){
                console.log("Error: ", err);
              }
              else{
                getEPSG(target_path, function(err, epsg){
                  var dataFile = Models.Datafile.build();
                  dataFile.userId = req.user.id;
                  dataFile.location = target_path;
                  dataFile.filename = shapeFiles[0];
                  dataFile.epsg = epsg;
                  dataFile.save().then(function(d){
                    res.send({id : d.id});
                  });
                })  
              }
            });
          });
        }
      });
    }
  });
    
  });

  // parse the incoming request containing the form data
  form.parse(req)
   
}

// Gets the current time stamp in secods
function getTimestamp(){
    return Math.floor(Date.now() / 1000);
}

// Extracts the uploaded zip file, adds the timestamp to the extracted
// folder and deletes the original zip file.
// do some refactoring to ease the callback hell.
function extractZip(zipFile, callback){
  var fileName = path.parse(zipFile).name;
  var targetName = fileName + "_" + getTimestamp();
  var targetPath = path.join(__dirname, './shape_files');
  console.log("===========================");
  console.log(targetPath);
  console.log(targetName);
  console.log(fileName);
  var filePath = path.join(__dirname, `./shape_files/${targetName}`);
  
  extract(zipFile, {dir: filePath}, function(err){
    if(err){  
      callback(err, null);
    }
    else{
      callback(null, `${filePath}/${fileName}`);
      };
    }
  );
}
// returns a list of shapefiles in the uploaded directory.
function getShapeFiles(directory, callback){
  console.log("=========================== get shape file");
  console.log(directory);
  var shapeFiles = [];
  fs.readdir(directory, function(err, files){
    if (err) {
      console.log("Error:  ", err);
      callback(err, null);
    }
    else{
      files.forEach(function(file, index){
        if(path.extname(file) == ".shp") {
          shapeFiles.push(file);
        }
      });
      callback(null, shapeFiles);
    }
  });

}
// Goes through the files in the path to verify that they all have the 
// specified extensions.
function verifyFiles(directory, whiteList, callback){
  var areRightFileTypes = true;
  fs.readdir(directory, function(err, files){
    if (err) {
      console.log("Error:  ", err);
      callback(err, null);
    }
    else{
      files.forEach(function(file, index){
          ext = path.extname(file);
          areRightFileTypes = areRightFileTypes && (ext === ".shp" || ext === ".shx" || ext === ".dbf" );
      });
    if(!areRightFileTypes){
      callback(null, directory);
    }
    else{
      console.log("Error:  not the right type of files");
      callback("wrong file type", null);
    }
    }
  });
}


function getEPSG(file, callback) {
  
  var dataset = gdal.open(file);
  var layer = dataset.layers.get(0);
  var epsg;
  if (layer.srs.getAttrValue("AUTHORITY",1)==null){
    request('http://prj2epsg.org/search.json?terms='+layer.srs.toWKT(), 
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          epsg = JSON.parse(body)['codes'][0]['code'];
          callback(null, epsg);
        }
      })
  } else {
    epsg = layer.srs.getAttrValue("AUTHORITY",1);
    callback(null, epsg);
  }        
}
