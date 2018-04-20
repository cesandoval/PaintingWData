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
    var stringParse = req.params.id
    //console.log("Upload viewer id: " + stringParse);
    var id = stringParse.substr(0, stringParse.indexOf('$$'));
    var size = stringParse.substr(stringParse.indexOf('$$')+2, stringParse.length);

    res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size});
  });
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

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
  router.get('/app/:datavoxelId', isAuthenticated, appController.show);
  router.get('/datajson/all/:datavoxelId', isAuthenticated, appController.getDatajsons)

  router.get('/update/shapes', isAuthenticated, updateController.updateShapes);

module.exports = router;
