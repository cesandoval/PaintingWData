var Model = require('../models');
 
 
module.exports.show = function(req, res) {
	console.log(req.user);
	res.render('app', {userSignedIn: req.isAuthenticated(), user: req.user, datavoxelId: req.params.datavoxelId});
}

module.exports.showPublic = function(req, res) {
	Model.Datavoxel.findOne({
      where: {id: req.params.datavoxelId}
    }).then(function(voxel) {
    	if(voxel) {
    		if(voxel.public == false) {
    			res.redirect("/users/login");
    		} else {
    			Model.User.findOne({
         	 		where: {id: voxel.userId}
        		}).then(function(user) {
        			console.log(user);
          			res.render('app', {userSignedIn: false, user: user, datavoxelId: req.params.datavoxelId});
        		});
    		}	
    	} else {
    		res.redirect("/users/login");
    	}
    });
}

module.exports.getDatajsons = function(req, res){
	Model.Datavoxel.findOne({
      where: {id: req.params.datavoxelId}
    }).then(function(voxel) {
    	if(voxel) {
    		if(voxel.public == false) {
    			res.redirect("/users/login");
    		} else {
    			Model.Datajson.findAll(
    				{
    					where: { datavoxelId: req.params.datavoxelId, 
    				},
        			include: [{model: Model.Datavoxel}, {model: Model.Datafile, include: [{
            			model: Model.Datalayer,
            			limit: 1}] 
					}]
        		}).then(function(datajsons){
					res.json(datajsons);
				});
    		}	
    	} else {
    		res.redirect("/users/login");
    	}
    });
}