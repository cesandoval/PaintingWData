var passport = require('passport'),
    auth = require('passport-local-authenticate'),
    signupController = require('../controllers/signupController.js'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    isAuthenticated = require('../controllers/signupController').isAuthenticated,
    router = require('express').Router();
//var jwt = require('jsonwebtoken');
//var verify = require('./verify');



  router.get('/', function(req, res, next) {
    res.render('index', {userSignedIn: req.isAuthenticated(), user: req.user});
  });

  router.get('/about', function (req, res) {
    res.render('about');
  });

  router.get('/documentation', function (req, res) {
    res.render('documentation');
  });

  router.get('/upload', isAuthenticated, fileUploadController.show);
  router.post('/upload', fileUploadController.upload);
  
  router.get('/uploadViewer/:id', isAuthenticated, function(req, res) {
    res.render('uploadViewer', {id: req.params.id, userSignedIn: req.isAuthenticated(), user: req.user});
  });
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);

  router.get('/layers/:id', isAuthenticated, fileViewerController.show);  
  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/app', appController.show);

module.exports = router;