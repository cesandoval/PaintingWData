var Model = require('../models'),
    app = require('../../app');

/**
* Saves a Datauserfile with the following attributes: state, userId, and datavoxelId.
*/
module.exports.save = function(req, res){
    Model.Datauserfile.destroy({
        where: {
            userId: req.body.userId,
            datavoxelId: req.body.voxelId,
        }
    })
    console.log(req.body);
    Model.Datauserfile.create({
        state: req.body.state,
        userId: req.body.userId,
        datavoxelId: req.body.voxelId,
    });
    console.log("Userfile has been saved.");
}

/**
* Finds the Datauserfile given a userId and a voxelId, and sends the state back
* to front-end.
*/
module.exports.import = function(req, res){
    Model.Datauserfile.findOne({
        where: {
            datavoxelId: req.params.datavoxelId,
        }
    }).then(dataUserFile => {
        if (dataUserFile != null) {
            var _state = dataUserFile.dataValues.state;
            console.log(_state)
            res.json(_state);
        }
    })
}