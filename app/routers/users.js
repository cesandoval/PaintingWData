var express = require('express');
var router = express.Router();
var passport = require('passport');
var isAuthenticated = require('../controllers/signupController').isAuthenticated;
var User = require('../models').User;
var mailer = require('../controllers/mailController');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

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

router.get('/reset-password', function(req, res) {
  res.render('users/resetPassword');
});

router.post('/reset-password-email', function(req, res) {
    var email = req.body.username;
    User.findOne({
      where: {email: email}
    }).then(function(user){
      if(user === null) {
        //put error message here that email is not registered!
        req.flash('signUpMessage',"Email does not exist");
        return;
      }
      mailer.sendResetPasswordEmail(email, user.urlLink);
      res.redirect('/');
    });
});

router.get('/reset-password/:id', function(req, res) {
  var id = req.params.id;
  User.findOne({
    where: {urlLink: id}
  }).then(function(user) {
    if(user === null) {
      res.redirect('/')
    } else {
      res.render('users/changePassword', user);
    } 
  });
});

router.post('/reset-password', function(req, res) {
  console.log("here");
  console.log(req);
  var id = req.params.id;
  var password = req.body.password;
  var passwordVerify = req.body.passwordVerify;
  console.log(password, passwordVerify);
  if(password !== passwordVerify) {
    return;
  }
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(req.body.password, salt); 

  User.findOne({
    where: {urlLink: id}
  }).then(function(user) {
    user.password = hash;
    user.save();
    res.redirect('users/login');
  });

});

router.get('/signup', function(req, res, next){
  res.render('users/signup', { title: 'Express', message: req.flash('signUpMessage')});
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

router.get('/verify/:id', function(req, res) {
  var id = req.params.id;
  User.findOne({
    where: {urlLink: id},
  }).then(function(user) {
    if(user) {
      user.verified = true;
      user.save();
      res.redirect('/users/login');
    } else {
      res.redirect('/');
    }
  }, function(error) {
    //do nothing
  });

});

module.exports = router;
