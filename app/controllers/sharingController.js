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
              s3Lib.uploadBlobToBucket({buf: buf}, hash, {bucket: bucket}, function(imageLink, err) {
                  if (err) {
                    console.log(err)
                    res.json({success:false, err: err})
                  } else {
                    var newDatasnapshot = Datasnapshot.build();
                    newDatasnapshot.datavoxelId = datavoxelId
                    newDatasnapshot.image =  'https://s3.amazonaws.com/' + bucket + '/' + imageLink
                    newDatasnapshot.hash = hash
                    newDatasnapshot.name = name
                    newDatasnapshot.save().then(function(snapshot){
                        console.log('Datasnapshot has been created', imageLink)
                        res.json({success:true, url: snapshot.image})
                    }); 
                  }  
              });
          } else {
              console.log('Datasnapshot already exists')
          }  
        })
}

module.exports.getSnapshots = function(req, res) {
    var datavoxelId = req.body.id;

    Model.Datasnapshot.findAll({
      where: {datavoxelId: datavoxelId }, 
      order:[['createdAt', 'ASC']],
      }).then(function(datasnapshots) {
          if (datasnapshots !== null) {
              res.json({snapshots: datasnapshots})
          }
        })
}

module.exports.deleteSnapshots = function(req, res) {
    // hashes is an array of ids
    var hashes = req.body.hashes;

    Model.Datasnapshot.findAll({
      where: { hash: hashes }, 
      }).then(function(datasnapshots) {
          if (datasnapshots !== null) {
            Model.Datasnapshot.destroy({
              where: { hash: hashes },
            }).then(() => {
                s3Lib.deleteDatasnapshots(bucket, hashes, function(hashes){
                    console.log('Datasnapshots have been destroyed', hashes)
                    res.json({hashes:hashes, success: true});
                })
            })   
          }
        })
}