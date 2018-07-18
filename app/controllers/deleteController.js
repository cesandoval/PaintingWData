var Model = require('../models')
var s3Lib = require('../../lib/awsFs')
var bucket = process.env.NODE_ENV === 'production' ? 'data-voxel-images-server2' : 'data-voxel-images';
var previewBucket = process.env.NODE_ENV === 'production' ? 'data-voxel-preview-server' : 'data-voxel-preview';

/**
 * Handles deletion of datasets or datalayers from the /datasets page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.deleteDataset = function(req, res){
    // Array of dataFileIds
    let datafileId = req.body.datafileId
    // delete relevant datafile
    Model.Datafile.update({
        deleted: true
    }, {
        where: {
            id: datafileId
        }
    }).then(function(){
        // delete relevant datalayers
        Model.Datalayer.update({
            deleted: true
        }, {
            where: {
                datafileId: datafileId
            }
        }).then(function(result){
            res.json({datafileId:datafileId, success: true});
        })
    })
} 


/**
 * Handles deletion of projects from the /projects page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.deleteDataVoxel = function(req, res){
    // Array of dataVoxelsIds
    let datavoxelId = req.body.dataVoxelId
    // delete relevant datafile
    Model.Datavoxel.destroy({
        where: {
            id: datavoxelId
        }
    }).then(function(){
        Model.Datajson.destroy({
            where: {
                datavoxelId: datavoxelId
            }
        }).then(function() {
            Model.Datavoxelimage.destroy({
                where: {
                    DatavoxelId: datavoxelId
                }
            }).then(function() {
                let bucketObj = {bucket: bucket, preview: previewBucket}
                s3Lib.deleteDatavoxelImage(bucketObj, datavoxelId, function(datavoxelId){
                    console.log('DatavoxelImage has been destroyed', datavoxelId)
                    res.json({dataVoxelId:datavoxelId, success: true});
                })
            })
        })
    })
} 
 