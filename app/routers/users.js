var express = require('express');
var router = express.Router();
var passport = require('passport');
var isAuthenticated = require('../controllers/signupController').isAuthenticated;

router.get('/login', function(req, res, next){
  res.render('users/login', { title: 'Express', message: req.flash('loginMessage') });
});
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
router.post('/login', 
  passport.authenticate('login', {
    failureRedirect: '/users/login',
    failureFlash : true,
  }),
  function(req, res){
    if(req.session.returnTo){
      res.redirect(req.session.returnTo);
    }
    else{
      res.redirect('/');
    }
  }
);
router.get('/signup', function(req, res, next){
  res.render('users/signp', { title: 'Express', message: req.flash('signUpMessage')});
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
