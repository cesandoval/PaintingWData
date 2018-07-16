var Model = require('../models')

/**
 * Handles deletion of datasets or datalayers from the /datasets page.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.deleteDataset = function(req, res){
    console.log(req.body)
    // Array of dataFileIds
    let datafileId = req.body.datafileId
    // delete relevant datafile
    Model.Datafile.destroy({
        where: {
            id: datafileId
        }
    }).then(function(){
        // delete relevant datalayers
        Model.Datalayer.destroy({
            where: {
                datafileId: datafileId
            }
        }).then(function(result){
            console.log(result)
            req.flash('layerAlert', "Your layer has been deleted");

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
    let dataVoxelId = req.body.dataVoxelId
    // delete relevant datafile
    Model.Datavoxel.destroy({
        where: {
            id: dataVoxelId
        }
    }).then(function(){
        req.flash('voxelAlert', "Your Voxel has been deleted");
    })
} 
