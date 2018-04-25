var Model = require('../models'),
    app = require('../../app');

/**
* Saves a Datauserfile with the following attributes: state, userId, and datavoxelId.
*/
module.exports.save = function(req, res){
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
        userId: req.body.userId,
        datavoxelId: req.body.voxelId,
    }).then(duf => {
        var _state = duf.get().state;
        res.send({ state: _state })
    })
}
