var Model = require('../models');

/**
* Saves a Datauserfile with the following attributes: state, userId, and datavoxelId.
*/
module.exports.save = function(req, res){
    Model.Datauserfile.findOne({
        where: {
            datavoxelId: req.body.voxelId,
        }
    }).then(datauserFile => {
        // if there is already a Datauserfile, just update it
        if (datauserFile != null) {
            Model.Datauserfile.update({
                data: req.body.data
            }, {
                where: {
                    datavoxelId: req.body.voxelId
                }
            }).then(updatedDatauserFile => {
                console.log("Userfile has been saved.", updatedDatauserFile.id)
                res.json({result: 'success'})
            })
        // Otherwise create it
        } else {
            Model.Datauserfile.create({
                data: req.body.data,
                datavoxelId: req.body.voxelId,
            }).then(newDatauserFile => {
                console.log("Userfile has been updated.", newDatauserFile.id)
                res.json({result: 'success'})
            })
        }
    })
}

/**
* Finds the Datauserfile given a voxelId, and sends the state back
* to front-end.
*/
module.exports.get = function(req, res){
    Model.Datauserfile.findOne({
        where: {
            datavoxelId: req.params.voxelId,
        }
    }).then(datauserFile => {
        // returns as an array ?!
        const data = {}
        if(datauserFile) 
            data = datauserFile.dataValues.data;
        res.json(data);
    })
}
