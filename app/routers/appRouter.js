var passport = require('passport'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    datalayerController = require('../controllers/datalayerController.js'),
    updateController = require('../controllers/updateController'),
    isAuthenticated = require('../controllers/signupController').isAuthenticated,
    router = require('express').Router();
//var jwt = require('jsonwebtoken');
//var verify = require('./verify');

  router.get('/', function(req, res, next) {
    res.render('index', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/about', function (req, res) {
    res.render('about', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/documentation', function (req, res) {
    res.render('documentation', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/blog', function (req, res) {
    res.render('blog', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/upload', isAuthenticated, fileUploadController.show);
  router.post('/upload', fileUploadController.upload);
  
  router.get('/uploadViewer/:id', isAuthenticated, function(req, res) {
    res.render('uploadViewer', {id: req.params.id, userSignedIn: req.isAuthenticated(), user: req.user});
  });
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);
  router.get('/getThumbnailData/:id', isAuthenticated, fileViewerController.serveThumbnailData);

  router.get('/layers/:id/:datafileId', isAuthenticated, datalayerController.show);
  router.post('/layers', isAuthenticated, datalayerController.computeVoxels);  

  router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);
  router.post('/voxels', isAuthenticated, datalayerController.transformVoxels);  

  // router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);

  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/app/:datavoxelId', isAuthenticated, appController.show);
  router.get('/datajson/all/:datavoxelId', isAuthenticated, appController.getDatajsons)

  router.get('/update/shapes', isAuthenticated, updateController.updateShapes);
  router.get('/update/shape', isAuthenticated, updateController.updateShape);
  //de[recated for now, will have to reroute to Upload endpoint
  router.get('/progressWidget', isAuthenticated, function(req, res) {
    res.render('progressWidget', { userSignedIn: req.isAuthenticated(), user: req.user})// { user: req.user})
    // res.render('progressWidget', { userSignedIn: req.isAuthenticated(), user: req.user}) // what params do you need to pass in to the view?
  })

module.exports = router;