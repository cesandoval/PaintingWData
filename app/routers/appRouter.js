var passport = require('passport'),
    appController = require('../controllers/appController.js'),
    sharingController = require('../controllers/sharingController.js'),
    fileUploadController = require('../controllers/fileUploadController.js'),
    fileViewerController = require('../controllers/fileViewerController.js'),
    datalayerController = require('../controllers/datalayerController.js'),
    updateController = require('../controllers/updateController'),
    voxelPrivacy = require('../controllers/voxelPrivacyController'),
    isAuthenticated = require('../controllers/signupController').isAuthenticated,
    deleteController = require('../controllers/deleteController'),
    saveUserfile = require('../controllers/userFileController'),
    editController = require('../controllers/editController'),
    projectController = require('../controllers/projectController'),
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
  
  // Actually saves the files into datalayers
  router.post('/uploadViewer', isAuthenticated, fileViewerController.saveShapes);

  router.post('/voxelPrivacy', isAuthenticated, voxelPrivacy.setVoxelPublicOrPrivate);

  router.get('/getMapData/:id', isAuthenticated, fileViewerController.serveMapData);
  router.get('/getThumbnailData/:id', isAuthenticated, fileViewerController.serveThumbnailData);

  router.get('/layers/:id', isAuthenticated, datalayerController.show);
  router.get('/layers/:id/:datafileId', isAuthenticated, datalayerController.show);
  router.post('/layers', isAuthenticated, datalayerController.computeVoxels);

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

  // Project routes
  router.get('/projects/:id', isAuthenticated, datalayerController.showProjects);
  router.get('/projects/:id/:datalayerId', isAuthenticated, datalayerController.showProjects);
  router.post('/projects', isAuthenticated, datalayerController.transformProjects);
  router.get('/projects/getAllPublic', projectController.showAllPublicProjects)

  // vue test page
  router.get('/vue', function (req, res) { 
    res.render('vue', {userSignedIn: req.isAuthenticated(), user: req.user}); 
  }); 

  // TODO(CreateProject)
  // router.get('/createProject/:id', isAuthenticated, datalayerController.createProject);

  // router.get('/voxels/:id', isAuthenticated, datalayerController.showVoxels);
  
  // App route
  router.get('/app/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.show);
  // Embed route
  router.get('/embed/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.show);
  
  router.get('/getDatalayers/:datafileId', isAuthenticated, fileViewerController.getDatalayers);
  router.get('/datajson/all/:datavoxelId', isAuthenticatedOrPublicVoxel, appController.getDatajsons);
  router.post('/screenshot', isAuthenticated, appController.uploadScreenshot);
  router.get('/screenshot', appController.getPublicVoxelScreenshots);
  router.post('/checkScreenshot', appController.checkScreenshot);

  // Sharing Routers
  router.post('/uploadSnapshot', isAuthenticated, sharingController.uploadSnapshot);
  router.post('/getSnapshots', sharingController.getSnapshots);
  router.get('/getSnapshotByHash/:hash', sharingController.getSnapshotByHash);
  router.post('/deleteSnapshots', isAuthenticated, sharingController.deleteSnapshots);
  router.get('/snap/:hash', sharingController.show);

  router.get('/update/shapes', isAuthenticated, updateController.updateShapes);

  // Routes to delete dataFiles and dataVoxels
  router.post('/delete/dataset', deleteController.deleteDataset);
  router.post('/delete/project', deleteController.deleteDataVoxel);

  // These are save/load files for a map's state, i.e. how the user exited it.
  router.post('/saveUserfile/', isAuthenticated, saveUserfile.save);
  router.get('/getUserfile/:datavoxelId', saveUserfile.get);

  // Routes to edit datafiles and datavoxels
  router.post('/editUserfile/', isAuthenticated, editController.editUserfile)
  router.post('/editVoxelName/', isAuthenticated, editController.editVoxelName)
module.exports = router;
