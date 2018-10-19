var Model = require('../models');
var s3Lib = require('../../lib/awsFs');
var Datavoxelimage = require('../models').Datavoxelimage;

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var bucket = process.env.NODE_ENV === 'production' ? 'data-voxel-snapshots-server' : 'data-voxel-snapshots';
var previewBucket = process.env.NODE_ENV === 'production' ? 'data-voxel-preview-server' : 'data-voxel-preview';



/**
 * Upload a new screenshot to PaintingWithData?
 * (Used in graph.js?)
 * @param {} req 
 * @param {*} res 
 */
module.exports.uploadSnapshot = function(req, res) {
  //Update react state so we know if this user has opened this voxel before
    var img = req.body.data;
    var hash = req.body.hash

    var datavoxelId = req.body.id;
    var data = img.replace(/^data:image\/\w+;base64,/, "");

    var buf = new Buffer(data, 'base64');
    console.log('The current bucket is:', bucket)

    Model.Datavoxel.findOne({
      where: {id: datavoxelId }, 
      include: [{model: Model.Datavoxelimage}]
      }).then(function(voxel) {
        if (voxel.Datavoxelimage === null) {
          s3Lib.uploadBlobToBucket({buf: buf, previewBuf: previewBuf}, datavoxelId, {bucket: bucket, previewBucket:previewBucket}, function(imageLink) {
            var newDataVoxelImage = Datavoxelimage.build();
            newDataVoxelImage.DatavoxelId = datavoxelId
            newDataVoxelImage.image =  'https://s3.amazonaws.com/' + bucket + '/' + imageLink
            newDataVoxelImage.public = voxel.public
            newDataVoxelImage.preview = true
            newDataVoxelImage.save().then(function(){
              console.log('DatavoxelImage has been created', imageLink)
            });   
          });
        } else if (voxel.Datavoxelimage.preview == null || voxel.Datavoxelimage.preview === false){
          s3Lib.uploadBlobToBucket({buf: buf, previewBuf: previewBuf}, datavoxelId, {bucket: bucket, previewBucket:previewBucket}, function(imageLink) {
            voxel.Datavoxelimage.update({preview: true}).then(() => {
              console.log('DatavoxelImage has been upated with a Preview Image at', imageLink)
            })
          })
        } else {
          console.log('DatavoxelImage already exists')
        }  
      })
}
