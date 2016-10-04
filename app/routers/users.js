var express = require('express');
var router = express.Router();
var passport = require('passport');
var isAuthenticated = require('../controllers/signupController').isAuthenticated;

router.get('/login', function(req, res, next){
  console.log("handled here---------------");
  res.render('users/login', { title: 'Express', flash: req.flash });
});
router.post('/login', passport.authenticate('login', {
    successRedirect: '/users/login',
    failureRedirect: '/users/signup',
    failureFlash : true 
  }));
router.get('/signup', function(req, res, next){
  res.render('users/signup', { title: 'Express', });
});
 router.post('/signup', passport.authenticate('signup',{
    successRedirect: '/users/login',
    failureRedirect: '/users/signup',
    failureFlash : true 
  }));

router.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});
module.exports = router;
