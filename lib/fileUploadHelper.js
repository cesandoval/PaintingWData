var fs = require('fs'),
    path = require('path'),
    gdal = require('gdal'),
    shapefile = require('shapefile'),
    async = require('async'),
    extract = require('extract-zip'),
    srs = require('srs'),
    request = require('request');
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

  var filePath = path.join(__dirname, './shape_files/'+targetName);
  
  extract(zipFile, {dir: filePath}, function(err){
    if(err){  
      callback(err, null, null);
    }
    else{
      callback(null, targetName, filePath);
      };
    }
  );
}
// returns a list of shapefiles in the uploaded directory.
function getShapeFiles(directory, callback){
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

// Walks the directory and returns only the source directory
function walk(dir, callback) {
	fs.readdir(dir, function(err, files) {
		if (err) throw err;
    var fileNum = 0; 
		files.forEach(function(file) {
			var filepath = path.join(dir, file);
			fs.stat(filepath, function(err,stats) {
				if (stats.isDirectory()) {
					walk(filepath, callback);
				} else if (stats.isFile()) {
          fileNum ++; 
          if (fileNum == files.length) {
					  callback(dir, stats);
          }
				}
			});
		});
	});
}

// Goes through the files in the path to verify that they all have the 
// specified extensions.
function verifyFiles(directory, callback){
  var areRightFileTypes = true;

  walk(directory, function(dir){
    fs.readdir(dir, function(err, files){
      if (err) {
        console.log("Error:  ", err);
        callback(err, null);
      }
      else{
        var validFiles = [];
        files.forEach(function(file, index){
            ext = path.extname(file);
            if(ext) {
              if (ext === ".shp" || ext === ".shx" || ext === ".dbf"  || ext === ".prj") {
                validFiles.push(ext);
              }
            }
        });
        if (validFiles.length == 4) {
          areRightFileTypes = false;
        }
      if (!areRightFileTypes){
        console.log(dir);
        callback(null, dir);
      }
      else{
        console.log("not the right type of files");
        callback("wrong file type", null);
      }
      }
    });
  })



}

function getEPSG(file, callback) {
  var dataset = gdal.open(file);
  var layer = dataset.layers.get(0);
  var geomType = gdal.Geometry.getName(layer.geomType);
  console.log('The geometry type is', geomType)
  var bbox = layer.getExtent().toPolygon();
  
  var epsg;
  if (layer.srs.getAttrValue("AUTHORITY",1)==null){
    var srsParse = srs.parse(layer.srs.toWKT()).srid;

    if (typeof srsParse == 'undefined') {
      request('http://prj2epsg.org/search.json?terms='+layer.srs.toWKT(), 
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            epsg = parseInt(JSON.parse(body)['codes'][0]['code']);
            var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
                d_srs = gdal.SpatialReference.fromEPSGA(4326);

            var transformation = new gdal.CoordinateTransformation(layer.srs, d_srs);
            bbox.transform(transformation)
            bbox.transformTo(d_srs);
            var centroid = JSON.parse(bbox.centroid().toJSON());
            bbox = JSON.parse(bbox.toJSON());

            bbox.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
            centroid.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
            callback(null, epsg, bbox, centroid, geomType);
          }
        })
      } else {
        epsg = srsParse;
        var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
            d_srs = gdal.SpatialReference.fromEPSGA(4326);

        var transformation = new gdal.CoordinateTransformation(layer.srs, d_srs);
        bbox.transform(transformation)
        bbox.transformTo(d_srs);
        var centroid = JSON.parse(bbox.centroid().toJSON());
        bbox = JSON.parse(bbox.toJSON());

        bbox.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
        centroid.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
        callback(null, epsg, bbox, centroid, geomType);
      }
  } else {
    epsg = layer.srs.getAttrValue("AUTHORITY",1);
    var s_srs = gdal.SpatialReference.fromEPSGA(epsg),
        d_srs = gdal.SpatialReference.fromEPSGA(4326);
    var transformation = new gdal.CoordinateTransformation(s_srs, d_srs);
    bbox.transform(transformation);
    bbox.transformTo(d_srs);
    var centroid = JSON.parse(bbox.centroid().toJSON());
    bbox = JSON.parse(bbox.toJSON());

    bbox.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
    centroid.crs = { type: 'name', properties: { name: 'EPSG:'+epsg}};
    callback(null, epsg, bbox, centroid);
  }        
}

module.exports = {
  getShapeFiles : getShapeFiles,
  extractZip : extractZip,
  signUpStrategy : getShapeFiles,
  verifyFiles : verifyFiles,
  getEPSG: getEPSG,
}