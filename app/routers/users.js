var express = require('express');
var router = express.Router();
var passport = require('passport');
var isAuthenticated = require('../controllers/signupController').isAuthenticated;
var User = require('../models').User;
var mailer = require('../controllers/mailController');
var bcrypt = require('bcrypt-nodejs');
var uuid = require('uuid');

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
  res.render('users/resetPassword', {message: ""});
});

router.post('/reset-password-email', function(req, res) {
    var email = req.body.username;
    User.findOne({
      where: {email: email}
    }).then(function(user){
      if(user === null) {
        //email is not registered!
        res.render('users/resetPassword', {message: "Email is not registered"});
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
      res.redirect('/');
    } else {
      res.render('users/changePassword', {message: ""});
    } 
  });
});

router.post('/reset-password/', function(req, res) {
  var id = req.headers.referer.split("/")[5];
  var password = req.body.password;
  var passwordVerify = req.body.passwordVerify;
  if(password !== passwordVerify) {
    res.redirect('localhost:3000/users/reset-password/' + id);
  }
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt); 

  User.findOne({
    where: {urlLink: id}
  }).then(function(user) {
    user.password = hash;
    //reset urlLink after password changed
    user.urlLink = uuid.v4();
    user.save();
    res.redirect('/');
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
      //reset urlLink after account verified
      user.urlLink = uuid.v4();
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
