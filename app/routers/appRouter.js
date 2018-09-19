var passport = require('passport'),
    appController = require('../controllers/appController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    datalayerController = require('../controllers/datalayerController.js'),
    updateController = require('../controllers/updateController'),
    voxelPrivacy = require('../controllers/voxelPrivacyController'),
    isAuthenticated = require('../controllers/signupController').isAuthenticated,
    deleteController = require('../controllers/deleteController')
    // saveUserfile = require('../controllers/userFileController');
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

  router.get('/tutorials', function (req, res) {
    res.render('tutorials', {userSignedIn: req.isAuthenticated(), user: req.user});
  });


  router.get('/upload', isAuthenticated, fileUploadController.show);
  // Wenzhe
  // Upload SHP files
  router.post('/upload', fileUploadController.upload);

  // Wenzhe 
  // Gets the information sent by the uploader and renders a map
  router.get('/uploadViewer/:id', isAuthenticated, function(req, res) {
    var stringParse = req.params.id
    var id = stringParse.substr(0, stringParse.indexOf('$$'));
    var size = stringParse.substr(stringParse.indexOf('$$')+2, stringParse.length);

    console.log("Upload viewer id: " + id);
    console.log("Upload viewer size: " + size);    
    res.render('uploadViewer', {id: id, userSignedIn: req.isAuthenticated(), user: req.user, size: size, accountAlert: req.flash('accountAlert')[0]});
  });
  
  // Wenzhe
  // Actually saves the files into datalayers
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

  router.post('/voxelPrivacy', isAuthenticated, voxelPrivacy.setVoxelPublicOrPrivate);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);
  router.get('/getThumbnailData/:id', isAuthenticated, fileViewerController.serveThumbnailData);

  router.get('/layers/:id', isAuthenticated, datalayerController.show);
  router.get('/layers/:id/:datafileId', isAuthenticated, datalayerController.show);
  router.post('/layers', isAuthenticated, datalayerController.computeVoxels);

  // Wenzhe
  // Middleware for getting datasets
  router.get('/datasets/', isAuthenticated, datalayerController.getDatasets);
  router.get('/datasets/:id', isAuthenticated, datalayerController.showDatasets);
  router.get('/datasets/:id/:datafileId', isAuthenticated, datalayerController.showDatasets);
  // Wenzhe
  // Middleware for creating voxels
  router.post('/datasets', isAuthenticated, datalayerController.computeVoxels);

  router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);
  router.get('/voxels/:id/:datalayerId', isAuthenticated, datalayerController.showVoxels);
  router.post('/voxels', isAuthenticated, datalayerController.transformVoxels);

  router.get('/projects/:id', isAuthenticated, datalayerController.showProjects);
  router.get('/projects/:id/:datalayerId', isAuthenticated, datalayerController.showProjects);
  router.post('/projects', isAuthenticated, datalayerController.transformProjects);

  // vue test page
  router.get('/vue', function (req, res) { 
    res.render('vue', {userSignedIn: req.isAuthenticated(), user: req.user}); 
  }); 

  // TODO(CreateProject)
  // router.get('/createProject/:id', isAuthenticated, datalayerController.createProject);

  // router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);

  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/app/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.show);
  router.get('/datajson/all/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.getDatajsons);
  router.post('/screenshot', isAuthenticated, appController.uploadScreenshot);
  router.get('/screenshot', appController.getPublicVoxelScreenshots);
  router.post('/checkScreenshot', appController.checkScreenshot);

  router.get('/update/shapes', isAuthenticated, updateController.updateShapes);

  // Routes to delete dataFiles and dataVoxels
  router.post('/delete/dataset', deleteController.deleteDataset);
  router.post('/delete/project', deleteController.deleteDataVoxel);

  // These are save/load files for a map's state, i.e. how the user exited it.
  // router.post('/saveuserfile/', isAuthenticated, saveUserfile.save);
  // router.get('/importuserfile/:datavoxelId', isAuthenticated, saveUserfile.import);
module.exports = router;
