var User = require('../models').User,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    passport = require('passport'),
    FacebookStrategy = require('passport-facebook').Strategy,
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
            //console.log(newUser);
            newUser.save().then(function(){
              //If testing locally change url to:  http://localhost:3000/users/verify/'
              mailer.sendVerificationEmail(email, 'http://localhost:3000/users/verify/' + id);
              // mailer.sendVerificationEmail(email, 'http://paintingwithdata.com/users/verify/' + id);
              // NOTE: this is a noteworthy change in the git diff
              return done(null, false, req.flash('signUpMessage', "We sent an email to you, please click the link to verify your account."));
            });   
           }
           }, function(error){
            return done(null, false, req.flash('signUpMessage', "User registration failed."));
            console.log(err);
        });
        
    });


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

var facebookStrategy = new FacebookStrategy({
  passReqToCallback : true,
  clientID: process.env.FACEBOOKCLIENTID, 
  clientSecret: process.env.FACEBOOKCLIENTSECRET,
  callbackURL: "http://localhost:3000/users/callback", //TODO: change this
  profileFields: ['id', 'email', 'name'],
},
function(req, accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
    User.findOne({
      where: {email: ""},
    }).then(function(user) {
      if (user) {
        return done(null, user)
      }
      else {
        var newUser = User.build();
        newUser.email = profile._json.email;
        newUser.password = "" //TODO: change something here
        newUser.verified = true;
        newUser.urlLink = uuid.v4();
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
  

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()){
    return next();
  }
  req.session.returnTo = req.url;

  res.redirect('/users/login');
}

module.exports = {
  LoginStrategy : loginStrategy,
  SignUpStrategy : signUpStrategy,
  FacebookLoginStrategy : facebookStrategy,
  isAuthenticated : isAuthenticated
}
