var passport = require('passport'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    datalayerController = require('../controllers/datalayerController.js'),
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

  router.get('/upload', isAuthenticated, fileUploadController.show);
  router.post('/upload', fileUploadController.upload);
  
  router.get('/uploadViewer/:id', isAuthenticated, function(req, res) {
    res.render('uploadViewer', {id: req.params.id, userSignedIn: req.isAuthenticated(), user: req.user});
  });
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);

  router.get('/layers/:id', isAuthenticated, datalayerController.show);
  router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);
  router.post('/layers', isAuthenticated, datalayerController.computeVoxels);  

  // router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);

  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/app/:datavoxelId', isAuthenticated, appController.show);
  router.get('/datajson/all/:datavoxelId', isAuthenticated, appController.getDatajsons)




module.exports = router;