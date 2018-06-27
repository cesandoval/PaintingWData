var User = require('../models').User,
    Datavoxel = require('../models').Datavoxel,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    async = require('async');
    uuid = require('uuid');
    mailer = require('./mailController');

module.exports.show = function(req, res) {
  res.render('users/signUp')
}

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id).then(
    function(user){
      done(null, user);
    },
    function(err){
      done(err, null);
    }
    );
});

/**
 * Local sign up strategy.
 * For the user to create an account using PaintingWithData.
 */
var signUpStrategy =
  new LocalStrategy({
      passReqToCallback : true
    },
    function(req, email, password, done) {
        User.findOne({
           where: {email: email},
        }).then(function(user) {

           if(user){
            //check if user email is verified
            var verified = user.verified;
            if(verified) {
              return done(null, false, req.flash('signUpMessage',"Email is already in use."));
            } else {
              console.log(" user is -----> : " + user.id);
              return done(null, false, req.flash('signUpMessage', "Please verify your email"));

            }
           }
           else{
            if(!(req.body.password === req.body.confirm_password)){
              return done(null, false, req.flash('signUpMessage',"Original password and confirmed password don't match"));
            }
            var newUser = User.build();
            newUser.email = email
            // generate hash by doing 10 rounds of salt. Is blocking.
            var salt = bcrypt.genSaltSync(10);
            var id = uuid.v4();
            var hash = bcrypt.hashSync(req.body.password, salt);
            newUser.password = hash;
            newUser.verified = false;
            newUser.urlLink = id;

            if(!req.body.use.length || !req.body.industry.length || !req.body.referal.length)
              return done(null, false, req.flash('signUpMessage',"Please make sure to complete the survey, thanks!"));

            //survey results
            newUser.use = req.body.use;
            newUser.industry = req.body.industry;
            newUser.referal = req.body.referal;

            newUser.save().then(function(){
              //If testing locally change url to:  http://localhost:3000/users/verify/'
              mailer.sendVerificationEmail(email, 'http://paintingwithdata.com/users/verify/' + id);
              return done(null, false, req.flash('signUpMessage', "We sent an email to you, please click the link to verify your account."));
            });
           }
           }, function(error){
            return done(null, false, req.flash('signUpMessage', "User registration failed."));
        });

    });

/**
 * Local login strategy.
 * Using PaintingWithData, verify that the user account is created and 
 * that the email and password are correct.
 */
var loginStrategy = new LocalStrategy({
    passReqToCallback : true
  },
  function(req, email, password, done) {

    User.findOne({
      where: {email: email},

    }).then(function(user) {
       if(user){
         if (user.verified){
          if(bcrypt.compareSync(password, user.password)) {
            return done(null, user, req.flash('loginMessage', "user successfully logged in"));
          }
          else {
            return done(null, false, req.flash('loginMessage', "invalid password"));
          }
         }
         else{
          return done(null, false, req.flash('loginMessage', "Please verify your account"));
         }
       }
       else{
          return done(null, false, req.flash('loginMessage', "invalid email"));
        }
       },  // do the above if succeeded
       function(error){
        return done(null, false, req.flash('loginMessage', "login failed"));
       }// do this if failed.
    );
  });


// The host is different in production
// Used for facebook and google strategies
var host = process.env === 'production' ? 'http://paintingwithdata.com/' : 'http://localhost:3000/';

/**
 * Use Facebook OAuth as another signup/login strategy.
 */
var facebookStrategy = new FacebookStrategy({
  passReqToCallback : true,
  clientID: process.env.FACEBOOKCLIENTID, // Get this from making facebook developer app
  clientSecret: process.env.FACEBOOKCLIENTSECRET, //Same as above
  callbackURL: host+"users/facebook_oauth",
  profileFields: ['id', 'email', 'name'],
},
function(req, accessToken, refreshToken, profile, done) {
    //console.log(profile);
    User.findOne({
      where: {email: profile._json.email}, //check if user with same email already exists
    }).then(function(user) {
      if (user) {
        return done(null, user);
      }
      else {
        var newUser = User.build();
        newUser.email = profile._json.email; //use facebook email as the database's email
        newUser.password = "something" //TODO: change something here, for now set the password to empty string because you don't need a password if you login using oauth
        newUser.verified = true; //No need to verify when using oauth
        newUser.urlLink = uuid.v4();
        newUser.extraUserInfo = profile._json //store all the rest of the info from facebook into here
        newUser.save().then(function() {
          console.log(newUser);
          return done(null, newUser)
        });
      }
    }, function(error) {
      console.log(error);
      return done(null, false);
    })

});

/**
 * Use Google OAuth as another signup/login strategy.
 */
var googleStrategy = new GoogleStrategy({
  passReqToCallback : true,
  clientID: process.env.GOOGLECLIENTID, // Get this from making google developer app
  clientSecret: process.env.GOOGLECLIENTSECRET, //Same as above
  callbackURL: host+"users/google_oauth",
},
function(req, accessToken, refreshToken, profile, done) {
    // console.log(profile);
    User.findOne({
      where: {email: profile.emails[0].value}, //check if user with same email already exists
    }).then(function(user) {
      if (user) {
        return done(null, user)
      }
      else {
        var newUser = User.build();
        newUser.email = profile.emails[0].value; //use gmail email as the database's email
        newUser.password = "something" //TODO: change something here, for now set the password to empty string because you don't need a password if you login using oauth
        newUser.verified = true; //No need to verify when using oauth
        newUser.urlLink = uuid.v4();
        newUser.extraUserInfo = profile._json //store all the rest of the info from google into here
        newUser.save().then(function() {
          // console.log(newUser);
          return done(null, newUser)
        });
      }
    }, function(error) {
      console.log(error);
      return done(null, false);
    })

});

/**
 * Check if user is Authenticated already.
 * If yes, then move on to next.
 * If no, then store current page in req.session.returnTo and return to login page.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  req.session.returnTo = req.url;

  res.redirect('/users/login');
}

/**
 * Check if user is Authenticated already or if voxel is public.
 * If yes, then move on to next.
 * If no, then store current page in req.session.returnTo and return to login page.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
var isAuthenticatedOrPublicVoxel = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
    Datavoxel.findOne({
      where: {id: req.params.datavoxelId}
    }).then(function(voxel) {
      if(voxel) {
        if(voxel.public === false || voxel.public === null) {
          res.redirect("/users/login");
        } else {
          return next();
        }
      } else {
        res.redirect("users/login");
      }
    });
  }
}

module.exports = {
  LoginStrategy : loginStrategy,
  SignUpStrategy : signUpStrategy,
  FacebookLoginStrategy : facebookStrategy,
  GoogleLoginStrategy : googleStrategy,
  isAuthenticated : isAuthenticated,
  isAuthenticatedOrPublicVoxel : isAuthenticatedOrPublicVoxel
}
