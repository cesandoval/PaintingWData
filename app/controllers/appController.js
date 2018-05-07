var Model = require('../models');
var s3 = require('../../lib/awsFs');
var screenshot = require('desktop-screenshot');
 
module.exports.show = function(req, res) {
	if(req.isAuthenticated()) {
		res.render('app', {userSignedIn: true, user: req.user, datavoxelId: req.params.datavoxelId});
	} else {
		Model.Datavoxel.findOne({
      		where: {id: req.params.datavoxelId }, include: [{model: Model.Datavoxelimage}]
    	}).then(function(voxel) {
        console.log(voxel);
          if (voxel.Datavoxelimage === null) {
            //create screenshot send to s3, get s3 link and save to db
            var screenshotName = "voxel" + voxel.id + ".png";
            screenshot(screenshotName, {width: 400}, function(error, complete) {
              if(error) {
                console.log("Screenshot failed", error);
              } else {
                console.log(screenshotName);
                //send it to s3
                //s3.uploadDirectoryToBucket(screenshotName, 'data-voxel-images', function() {
                  //get link for picture in s3 directory and save to datavoxelimages db
                  //console.log("epic");
                //});
              }
            });
        }
    		Model.User.findOne({
         	 	where: {id: voxel.userId}
        	}).then(function(user) {
          		res.render('app', {userSignedIn: false, user: user, datavoxelId: req.params.datavoxelId});
        	});		
		});
	}
}


    
            //screenshot image here and save to s3, then save s3 link to db
           

module.exports.getDatajsons = function(req, res){
    Model.Datajson.findAll({
    	where: { datavoxelId: req.params.datavoxelId, },
        include: [{model: Model.Datavoxel}, {model: Model.Datafile, include: [{model: Model.Datalayer, limit: 1}]}]
    }).then(function(datajsons){
		res.json(datajsons);
	});
}	