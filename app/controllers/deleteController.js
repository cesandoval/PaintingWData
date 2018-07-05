var Model = require('../models')

/**
 * Handles deletion of datasets or datalayers from the /datasets page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.deleteDataset = function(req, res){
    let dataFileIds = req.body.datalayerIds
    // delete relevant datafile
    Model.Datafile.destroy({
        where: {
            id: dataFileIds
        }
    }).then(function(){
        // delete relevant datalayers
        Model.Datalayer.update({
            where: {
                datafileId: dataFileIds
            }
        }).then(function(){
            if (dataFileIds.length == 1) {
                req.flash('layerAlert', "Your layer has been deleted");
            } else {
                req.flash('layerAlert', "Your layers have been deleted");
            }
        })
    })
} 

/**
 * Handles deletion of projects from the /projects page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.deleteDataVoxel = function(req, res){
    let dataVoxelIds = req.body.dataVoxelIds
    // delete relevant datafile
    Model.Datavoxel.destroy({
        where: {
            id: dataVoxelIds
        }
    }).then(function(){
        req.flash('voxelAlert', "Your Voxel has been deleted");
    })
} 
