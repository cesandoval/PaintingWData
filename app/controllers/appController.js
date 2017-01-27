var Model = require('../models'),
    connection = require('../sequelize.js');
 
 
module.exports.show = function(req, res) {
    
    res.render('app', {userSignedIn: req.isAuthenticated(), user: req.user, datavoxelId: req.params.datavoxelId});
}

module.exports.getDatajsons = function(req, res){
	Model.Datajson.findAll({where: {
		datavoxelId: req.params.datavoxelId,
		},
        include: [{model: Model.Datavoxel}]
        }).then(function(datajsons){
		res.json(datajsons);
	});
}