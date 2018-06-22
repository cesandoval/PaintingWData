var Model = require('../models');
var s3Lib = require('../../lib/awsFs');
var Datavoxelimage = require('../models').Datavoxelimage;

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var bucket = process.env === 'production' ? 'data-voxel-images-server2' : 'data-voxel-images';

/**
 * Displays app.jade on /app/{datavoxelId}
 * This is the interactive page where the user views the voxel project
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.show = function(req, res) {
  // user is signed in
  if(req.isAuthenticated()) {
    res.render('app', {userSignedIn: true, user: req.user, datavoxelId: req.params.datavoxelId});
  // user is not signed in, gets redireted to /users/login because it is not authenticated
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


/**
 * TODO: fill this out
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.getPublicVoxelScreenshots = function(req, res) {
  Model.Datavoxelimage.findAll({
    limit: 10,
    order:[['createdAt', 'ASC']],
    // where: {deleted: 0}
  }).then(function(screenshotLinks) {
    var images = [];
    screenshotLinks.forEach(function(screenshotLink) {
      images.push([screenshotLink.image,screenshotLink.DatavoxelId,screenshotLink.createdAt]);
    });
    console.log('latest images are', images)
    res.render('index', {userSignedIn: req.isAuthenticated(), user: req.user, screenshots: images});
    // res.send(response);
  });

}

/**
 * TODO: fill this out
 * @param {} req 
 * @param {*} res 
 */
module.exports.uploadScreenshot = function(req, res) {
  //Update react state so we know if this user has opened this voxel before
  var img = req.body.data;

  var datavoxelId = req.body.id;
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  console.log('The current bucket is:', bucket)

  Model.Datavoxelimage.findOne({
    where: {DatavoxelId: datavoxelId}
  }).then(function(dataVoxelImage) {
    if (dataVoxelImage == null) {
      var imgURL = s3Lib.uploadBlobToBucket(buf, datavoxelId, bucket, function(imageLink) {
        var dataVoxelImage = Datavoxelimage.build();
        dataVoxelImage.DatavoxelId = datavoxelId
        dataVoxelImage.image =  'https://s3.amazonaws.com/' + bucket + '/' + imageLink
        dataVoxelImage.save().then(function(){
          console.log('DatavoxelImage has been created', imageLink)
        });   
      });
    } else {
      console.log('DatavoxelImage already exists')
    }
  })
}

/**
 * TODO fill this out
 * @param {*} req 
 * @param {*} res 
 */
module.exports.checkScreenshot = function(req, res) {
  var datavoxelId = req.body.datavoxelId;
  var params = {
    Bucket: bucket,
    Key: datavoxelId.toString() + '.png',
  }

  s3.headObject(params, function(err, metadata) {
    if (err && err.code === 'NotFound') {
      // Handle no object on cloud here
      console.log(err)
      res.json({screenshot: metadata})
    } else {
      res.json({screenshot: true})
    }
  })
}

/**
 * TODO fill this out
 * @param {*} req 
 * @param {*} res 
 */
module.exports.getDatajsons = function(req, res){
  // add toggle in first datajson indicating if we should screenshot this page
    Model.Datajson.findAll({
    	where: { datavoxelId: req.params.datavoxelId, },
        include: [
			{model: Model.Datavoxel}, 
			{model: Model.Datafile, 
				include: [
					{model: Model.Datalayer, limit: 1}
				]
			}
		]
    }).then(function(datajsons){
      Model.Datavoxel.findOne({
		  where: {id: req.params.datavoxelId }, 
		  include: [{model: Model.Datavoxelimage}]
      }).then(function(voxel) {
        if (voxel.Datavoxelimage === null && voxel.public == true) {
          //screenshot needed
          datajsons[0].dataValues.screenshot = true
          res.json(datajsons);
        } else {
          //screenshot not needed
          datajsons[0].dataValues.screenshot = false
          res.json(datajsons);
        }  
    });
	});
}	

