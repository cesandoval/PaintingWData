var passport = require('passport'),
    auth = require('passport-local-authenticate'),
    signupController = require('../controllers/signupController.js'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),

    router = require('express').Router();
//var jwt = require('jsonwebtoken');
//var verify = require('./verify');



  router.get('/', function(req, res, next) {
    res.render('index');
  });

  router.get('/about', function (req, res) {
    res.render('about');
  });

  router.get('/documentation', function (req, res) {
    res.render('documentation');
  });

  router.get('/upload', fileUploadController.show);
  router.post('/upload', fileUploadController.upload);
  
  router.get('/uploadViewer/:id', function(req, res) {
    res.render('uploadViewer', {id: req.params.id});
  });
  router.post('/uploadViewer', fileViewerController.saveShapes);

  router.get('/getMapData/:id', fileViewerController.serveMapData);

  router.get('/app', appController.show);

module.exports = router;