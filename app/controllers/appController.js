var Model = require('../models');
var s3 = require('../../lib/awsFs');
var blobUtil = require("blob-util");
var atob = require('atob');
 
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

module.exports.getPublicVoxelScreenshots = function(req, res) {
  // Model.Datavoxelimage.findAll({
  //   limit: 10,
  //   order:[['createdAt', 'ASC']],
  //   where: {deleted: 0}
  // }).then(function(screenshotLinks) {
  //   var images = [];
  //   screenshotLinks.forEach(function(screenshotLink) {
  //     images.push(screenshotLink.image);
  //   });
  //   var response = {screenshots: images};
  //   res.send(response);
  // });
  res.render('index', {userSignedIn: req.isAuthenticated(), user: req.user, screenshots: ["https://s3.amazonaws.com/data-voxel-images/23466317216_b99485ba14_o-panorama.jpg"] });
}

//TODO: Fix blob issue
module.exports.uploadScreenshot = function(req, res) {
  //Update react state so we know if this user has opened this voxel before
  var img = req.body.data;
  var datavoxelId = req.body.id;
  //console.log(img);

  var byteString = atob(img.split(',')[1]);
  // separate out the mime component
  var mimeString = img
                .split(',')[0]
                .split(':')[1]
                .split(';')[0]
  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  var ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  var data = blobUtil.createBlob([ab], { type: mimeString });
  var imgURL = s3.uploadBlobToBucket(data, 'data-voxel-images', function(imageLink) {
      console.log(imageLink);
      //Add imagename (the link) and datavoxelId to database
    });
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

