var Voxel = require('../models').Datavoxel,
    async = require('async'),
    path = require('path'),
    request = require('request'),
    app = require('../../app'),
    Channel = require('../../worker/channel');
    processVoxels = require('../../worker/worker2').processVoxels;


module.exports.setVoxelPublicOrPrivate = function(req, res) {
	if(req.body.id && req.body.public) {
		var id = req.body.id;
		var isPublic = req.body.public;
		Voxel.findOne({
			where: {id: id},
		}).then(function(voxel) {
			voxel.public = isPublic;
			voxel.save();
		}, function(error){
            console.log(err);
        });
		
	} else {
		res.status(400).send({
            message: 'Invalid voxel id or public field not a boolean'
          });
	}
};