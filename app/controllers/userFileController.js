var Model = require('../models'),
    app = require('../../app');

module.exports.save = function(req, res){
    Model.Datauserfile.create({
        state: req.body.state,
        userId: req.body.userId,
        datavoxelId: req.body.voxelId,
    });
    console.log("Userfile has been saved.");
}
