var fileUploadHelper = require('../../lib/fileUploadHelper'), 
    Models = require('../models'),
    path = require('path'),
    fs = require('fs'),
    awsfs = require('../../lib/awsFs'),
    formidable = require('formidable');
    fs_extra = require('fs-extra')

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
      var zipDir = path.join(path.dirname(file.path), file.name);
      fileUploadHelper.extractZip(zipDir, function(err, targetName, targetPath){
        if(err){
          console.log("Error: ", err);
          
        }
        else{
          fileUploadHelper.verifyFiles(targetPath, function(err, targetPath){
            if(err){
                console.log("Error: ", err);
                res.redirect(200, '..');
            }
            else{
            fileUploadHelper.getShapeFiles(targetPath, function(err, shapeFiles){
              if(err){
                console.log("Error: ", err);
              }
              else{
                fileUploadHelper.getEPSG(targetPath, function(err, epsg, bbox, centroid){

                  if(process.env.NODE_ENV === 'production'){
                    //save everything in s3
                    awsfs.uploadToBucket(zipDir, `paintingwithdata/${targetName}/zipped`, function(err){
                      if(err){
                        console.log("Error uploading zip file: ")
                        console.log(err, err.stack)
                      }
                      else{
                        console.log(targetPath);
                        awsfs.uploadDirectoryToBucket(targetPath, `paintingwithdata/${targetName}/extracted`, function(err){
                          if(err){
                            console.log("Error");
                            console.log(err, err.stack);
                          }
                          else{
                            console.log(`Files in ${targetPath} have been successfuly uploaded to s3`);
                          }
                        });
                      }
                    });
                  }

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
    
  });

  // parse the incoming request containing the form data
  form.parse(req)
   
}
