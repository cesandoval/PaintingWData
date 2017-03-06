var AWS = require('aws-sdk');
var fs = require('fs');
var path = require('path');

var s3 = new AWS.S3({apiVersion: '2006-03-01'});

module.exports.uploadToBucket = upload


function upload(filePath, bucket, callback){
  
  var uploadParams = {Bucket: bucket, Key: '', Body: ''};
  var fileStream = fs.createReadStream(filePath);

  fileStream.on('error', function(err) {
    console.log('File Error', err);
  });

  uploadParams.Body = fileStream;

  
  uploadParams.Key = path.basename(filePath);

  s3.upload (uploadParams, function (err, data) {
    if (err) {
      callback(err, null)
    } if (data) {
      callback(null, data)
    }
  });
}

module.exports.uploadDirectoryToBucket = function(directory, bucket, callback){
  fs.readdir(directory, (err, files) => {
    files.forEach(file => {
      upload(path.join(directory, file), bucket, function(err, callback){
        if(err){
          console.log("Error uploading files")
          console.log(err, err.stack);
        }
      })
    });
    callback(null)
  })
};

module.exports.downloadFiles = function(localDir, bucket, callback){
  s3Client.downloadDir('.', 'paintingwithdata', function(err, localDir){
    if(err){
      console.log("Error downloading dir")
      console.log(err, err.stack);
      callback(err, null);
    }
    else{
      callback(null, path);
    }
  })
}

module.exports.fetchFromBucket = function(objectPath, callback){
  console.log("object path: ", objectPath);
  var params = {Bucket: 'paintingwithdata'};
  s3.listObjects(params, function(err, data){
    console.log("params ", params)
    if(err){

      console.log("Error accessing bucket: ");
      console.log(err, err.stack);
      callback(err);
    }
    else{

      var promise = new Promise(function(resolve, reject) {
          data.Contents.filter(function(obj){
            return obj.Key.includes(objectPath.split('/')[1]) && !obj.Key.endsWith('.zip');
          }).map((obj)=>{return obj.Key}).forEach(function(filePath){
              
              var downloadParams = {Bucket: params.Bucket, Key: 'filePath'};
              var dirName = filePath.split('/')[0];
              var fileName = filePath.split('/')[2];
              if (!fs.existsSync(path.join(__dirname, `/tmp`))){
                  fs.mkdirSync(path.join(__dirname, `/tmp`));
              }
              if (!fs.existsSync(path.join(__dirname, `/tmp/${dirName}`))){
                  fs.mkdirSync(path.join(__dirname, `/tmp/${dirName}`));
              }
              var s3Params = { Bucket: params.Bucket,
                                Key: `${dirName}/extracted/${fileName}` }
              s3.getObject(s3Params, function(err, data){
                if(err){
                  console.log(err)
                }
                else{
                  fs.writeFile(path.join(__dirname, `/tmp/${dirName}/${fileName}`), data.Body, function(err){
                    if(err){
                      console.log(err)
                    }
                  })
                }
              });
              
          })
          var fileCount = 0;
          fs.readdir(path.join(__dirname, `/tmp/${objectPath.split('/')[1]}`), function(err, files){
            if(err){
              console.log(err);
            }
            else{
              fileCount = files.length;
              console.log(fileCount);
              if (fileCount == 7) {
                resolve(path.join(__dirname, `/tmp/${objectPath.split('/')[1]}`));
              }
              else {
                reject(Error("It broke"));
              }
            }
          });
        });


        promise.then(function(result) {
          callback(null, result);
        }, function(err) {
          callback(err, null)
        });
    
      }

  });
}

