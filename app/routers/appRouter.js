var passport = require('passport'),
    auth = require('passport-local-authenticate'),
    signupController = require('../controllers/signupController.js'),
    appController = require('../controllers/appController.js')
    fileUploadController = require('../controllers/fileUploadController.js');

//var jwt = require('jsonwebtoken');
//var verify = require('./verify');

module.exports = function(express) {
  var router = express.Router()

  // route middleware that will happen on every request
  router.use(function(req, res, next) {
      // log each request to the console
      // console.log(req.method, req.url);

      // continue doing what we were doing and go to the route
      next(); 
  });

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index');
  });

  router.get('/about',authenticationMiddleware(), function (req, res) {
    res.render('about');
  });

  router.get('/documentation', function (req, res) {
    res.render('documentation');
  });

  router.get('/upload', fileUploadController.show);
  router.post('/upload', fileUploadController.upload);
  // router.post('/upload', function (req, res) {
  //   res.render('about');
  // });

  router.get('/app', appController.show);

  // route with parameters (http://localhost:8080/hello/:name)
  router.get('/hello/:name', function(req, res) {
    res.send('hello ' + req.params.name + '!');

  });

  // All of this is for Login
  var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
      return next()
    req.flash('error', 'You have to be logged in to access the page.')
    res.redirect('/')
  }
  
  router.get('/users/signup', signupController.show)
  router.post('/users/signup', signupController.signup)

  router.get('/users/login', function (req, res) {
    res.render('users/login');

  });

  // router.post('/users/login', passport.authenticate('local', {
  //   successRedirect: '/',
  //   failureRedirect: '/users/login',
  //   failureFlash: true 
  // }))

  router.post('/users/login', function(req, res, next) {
    // this gives a json with the username and pwd
    // console.log(req.body);
    passport.authenticate('local', function(err, user, info) {
      // console.log(111111)
      // console.log(user)
      // console.log(info)
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log(user);
        return res.status(401).json({
          err: info
        });
      }
      req.logIn(user, function(err) {
        if (err) {
          return res.status(500).json({
            err: 'Could not log in user'
          });
        }
          
        //var token = verify.getToken(user);
        //var token = jwt.sign(user, 'shhhhh');
        //console.log(token)
        
        return res.status(200).json({
          status: 'Login successful!',
          success: true,
          //token: token
        });
      });
    }) (req,res,next);
    //res.redirect('/');
  });

  // router.get('/dashboard', isAuthenticated, function(req, res) {
  //   res.render('dashboard')
  // })

  router.get('/users/logout', function(req, res) {
      req.logout();
      // res.status(200).json({
      //   status: 'Bye!'
      // });
      res.redirect('/')
  });

  return router
}


function authenticationMiddleware () {  
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    res.redirect('/')
  }
}