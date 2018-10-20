var Model = require('../models');
var s3Lib = require('../../lib/awsFs');
var Datasnapshot = require('../models').Datasnapshot;
var bucket = process.env.NODE_ENV === 'production' ? 'data-voxel-snapshots-server' : 'data-voxel-snapshots';

/**
 * Upload a new screenshot to PaintingWithData?
 * (Used in graph.js?)
 * @param {} req 
 * @param {*} res 
 */
module.exports.uploadSnapshot = function(req, res) {
  //Update react state so we know if this user has opened this voxel before
    var img = req.body.data
    var hash = req.body.hash
    var name = req.body.name

    var datavoxelId = req.body.id;
    var data = img.replace(/^data:image\/\w+;base64,/, "")

    var buf = new Buffer(data, 'base64')
    console.log('The current bucket is:', bucket)

    Model.Datasnapshot.findOne({
      where: {hash: hash }, 
      }).then(function(datasnapshot) {
          if (datasnapshot === null) {
              s3Lib.uploadBlobToBucket({buf: buf}, hash, {bucket: bucket}, function(imageLink) {
                  var newDatasnapshot = Datasnapshot.build();
                  newDatasnapshot.datavoxelId = datavoxelId
                  newDatasnapshot.image =  'https://s3.amazonaws.com/' + bucket + '/' + imageLink
                  newDatasnapshot.hash = hash
                  newDatasnapshot.name = name
                  newDatasnapshot.save().then(function(){
                      console.log('Datasnapshot has been created', imageLink)
                  });   
              });
          } else {
              console.log('Datasnapshot already exists')
          }  
        })
}
