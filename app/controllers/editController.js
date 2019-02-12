var Model = require('../models')

/**
 * Handles updating datasets or datalayers from the /datasets page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.editUserfile = function(req, res){
    // dataFileId to be updated
    let datafileId = req.body.id
    let userFileName = req.body.userFileName
    let updatedAt = req.body.updatedAt
    let description = req.body.description
    
    // delete relevant datafile
    Model.Datafile.update({
        userFileName: userFileName,
        description: description,
        updatedAt: updatedAt
    }, {
        where: {
            id: datafileId
        }
    }).then(function(){
        // update relevant datalayers
        Model.Datalayer.update({
            description: description,
            userLayerName: userFileName,
            updatedAt: updatedAt
        }, {
            where: {
                datafileId: datafileId
            }
        }).then(function(result){
            res.json({datafileId:datafileId, updated: true});
        })
    })
} 

/**
 * Handles updating voxels from the /projects page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.editVoxelName = function(req, res){
    // voxel to be updated
    let id = req.body.id
    let voxelId = req.body.voxelId
    let voxelName = req.body.userFileName
    let updatedAt = req.body.updatedAt
    
    // update relevant datavoxel
    Model.Datafile.update({
        voxelname: voxelName,
        description: '',
        updatedAt: updatedAt
    }, {
        where: {
            // voxelId: voxelId
            id: id
        }
    }).then(function(result){
        res.json({voxelId:voxelId, updated: true});
    })
} 