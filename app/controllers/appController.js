var Model = require('../models');
 
module.exports.show = function(req, res) {
	if(req.isAuthenticated()) {
		res.render('app', {userSignedIn: true, user: req.user, datavoxelId: req.params.datavoxelId});
	} else {
		Model.Datavoxel.findOne({
      		where: {id: req.params.datavoxelId}
    	}).then(function(voxel) {
    		Model.User.findOne({
         	 	where: {id: voxel.userId}
        	}).then(function(user) {
          		res.render('app', {userSignedIn: false, user: user, datavoxelId: req.params.datavoxelId});
        	});		
		});
	}
}

module.exports.getDatajsons = function(req, res){
    Model.Datajson.findAll({
    	where: { datavoxelId: req.params.datavoxelId, },
        include: [{model: Model.Datavoxel}, {model: Model.Datafile, include: [{model: Model.Datalayer, limit: 1}]}]
    }).then(function(datajsons){
		res.json(datajsons);
	});
}	