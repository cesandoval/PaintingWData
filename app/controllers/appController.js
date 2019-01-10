var Model = require('../models');
var s3Lib = require('../../lib/awsFs');
var Datavoxelimage = require('../models').Datavoxelimage;

var AWS = require('aws-sdk');
var s3 = new AWS.S3({apiVersion: '2006-03-01'});
var bucket = process.env.NODE_ENV === 'production' ? 'data-voxel-images-server2' : 'data-voxel-images';
var previewBucket = process.env.NODE_ENV === 'production' ? 'data-voxel-preview-server' : 'data-voxel-preview';

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
 * Find (up to) the 10 most recent public voxels.
 * Display them on the home page.
 * Render the index.jade page with the given screenshots.
 * @param {Object} req 
 * @param {Object} res 
 */
module.exports.getPublicVoxelScreenshots = function(req, res) {
  Model.Datavoxelimage.findAll({
    limit: 12,
    order:[['createdAt', 'DESC']],
    where: {public: true}
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
 * Upload a new screenshot to PaintingWithData?
 * (Used in graph.js?)
 * @param {} req 
 * @param {*} res 
 */
module.exports.uploadScreenshot = function(req, res) {
  //Update react state so we know if this user has opened this voxel before
  var img = req.body.data;
  var preview = req.body.preview;

  var datavoxelId = req.body.id;
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var previewData = preview.replace(/^data:image\/\w+;base64,/, "");

  var buf = new Buffer(data, 'base64');
  var previewBuf = new Buffer(previewData, 'base64');
  console.log('The current bucket is:', bucket)

  Model.Datavoxel.findOne({
    where: {id: datavoxelId }, 
    include: [{model: Model.Datavoxelimage}]
    }).then(function(voxel) {
      if (voxel.Datavoxelimage === null) {
        s3Lib.uploadBlobToBucket({buf: buf, previewBuf: previewBuf}, datavoxelId, {bucket: bucket, previewBucket:previewBucket}, function(imageLink) {
          var newDataVoxelImage = Datavoxelimage.build();
          newDataVoxelImage.DatavoxelId = datavoxelId
          newDataVoxelImage.image =  'https://s3.amazonaws.com/' + bucket + '/' + imageLink
          newDataVoxelImage.public = voxel.public
          newDataVoxelImage.preview = true
          newDataVoxelImage.save().then(function(){
            console.log('DatavoxelImage has been created', imageLink)
          });   
        });
      } else if (voxel.Datavoxelimage.preview == null || voxel.Datavoxelimage.preview === false){
        s3Lib.uploadBlobToBucket({buf: buf, previewBuf: previewBuf}, datavoxelId, {bucket: bucket, previewBucket:previewBucket}, function(imageLink) {
          voxel.Datavoxelimage.update({preview: true}).then(() => {
            console.log('DatavoxelImage has been upated with a Preview Image at', imageLink)
          })
        })
      } else {
        console.log('DatavoxelImage already exists')
      }  
    })
}

/**
 * Check that screenshot exists?
 * (Used in pixels.js?)
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
 * Find all datajsons with a specifid datavoxelId
 * (Used in layers.js?)
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
          {model: Model.Datalayer, limit: 1, }
            // include: [
            //   {model: Model.Datadbf, limit: 1}
            // ]}
				]
			}
		]
    }).then(function(datajsons){
      Model.Datavoxel.findOne({
		  where: {id: req.params.datavoxelId }, 
		  include: [{model: Model.Datavoxelimage}]
      }).then(function(voxel) {
        if (voxel.Datavoxelimage === null || voxel.Datavoxelimage.preview === null || voxel.Datavoxelimage.preview === false) {
          console.log('Screenshot needed on the backend!')
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

