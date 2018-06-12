var passport = require('passport'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    datalayerController = require('../controllers/datalayerController.js'),
    updateController = require('../controllers/updateController'),
    voxelPrivacy = require('../controllers/voxelPrivacyController'),
    isAuthenticated = require('../controllers/signupController').isAuthenticated,
    isAuthenticatedOrPublicVoxel = require('../controllers/signupController').isAuthenticatedOrPublicVoxel,
    router = require('express').Router();
//var jwt = require('jsonwebtoken');
//var verify = require('./verify');

  router.get('/', appController.getPublicVoxelScreenshots);

  router.get('/about', function (req, res) {
    res.render('about', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/documentation', function (req, res) {
    res.render('documentation', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/blog', function (req, res) {
    res.render('blog', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/blogs', function (req, res) {
    res.render('blogs', {userSignedIn: req.isAuthenticated(), user: req.user});
  });


  router.get('/upload', isAuthenticated, fileUploadController.show);
  router.post('/upload', fileUploadController.upload);

  router.get('/uploadViewer/:id', isAuthenticated, function(req, res) {
    var stringParse = req.params.id
    //console.log("Upload viewer id: " + stringParse);
    var id = stringParse.substr(0, stringParse.indexOf('$$'));
    var size = stringParse.substr(stringParse.indexOf('$$')+2, stringParse.length);
    
    res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});
  });
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);
  router.post('/voxelPrivacy', isAuthenticated, voxelPrivacy.setVoxelPublicOrPrivate);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);
  router.get('/getThumbnailData/:id', isAuthenticated, fileViewerController.serveThumbnailData);

  router.get('/layers/:id', isAuthenticated, datalayerController.show);
  router.get('/layers/:id/:datafileId', isAuthenticated, datalayerController.show);
  router.post('/layers', isAuthenticated, datalayerController.computeVoxels);

  router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);
  router.get('/voxels/:id/:datalayerId', isAuthenticated, datalayerController.showVoxels);
  router.post('/voxels', isAuthenticated, datalayerController.transformVoxels);

  // router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);

  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/app/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.show);
  router.get('/datajson/all/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.getDatajsons);
  router.post('/screenshot', isAuthenticated, appController.uploadScreenshot);
  router.get('/screenshot', appController.getPublicVoxelScreenshots);
  router.post('/checkScreenshot', appController.checkScreenshot);

  router.get('/update/shapes', isAuthenticated, updateController.updateShapes);



module.exports = router;
