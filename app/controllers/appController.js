var Model = require('../models');
var s3 = require('../../lib/awsFs');
 
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

//add route here to accept blob from frontend and save it to s3 database
module.exports.uploadScreenshot = function(req, res) {
  console.log(req.body);
}
            
module.exports.getDatajsons = function(req, res){
  // add toggle in first datajson indicating if we should screenshot this page
    Model.Datajson.findAll({
    	where: { datavoxelId: req.params.datavoxelId, },
        include: [{model: Model.Datavoxel}, {model: Model.Datafile, include: [{model: Model.Datalayer, limit: 1}]}]
    }).then(function(datajsons){
      Model.Datavoxel.findOne({
          where: {id: req.params.datavoxelId }, include: [{model: Model.Datavoxelimage}]
      }).then(function(voxel) {
        if (voxel.Datavoxelimage === null) {
          //screenshot needed
          //datajsons.push({screenshot: true});
          res.json(datajsons);
        } else {
          //screenshot not needed
          //datajsons.push({screenshot: false});
          res.json(datajsons);
        }  
    });
	});
}	

