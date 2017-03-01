var User = require('../models').User,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    passport = require('passport'),
    async = require('async');
    uuid = require('uuid');
    nodemailer = require('nodemailer');


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

var sendVerificationEmail = function(email, verificationLink) {
  console.log(process.env.USEREMAIL);
  console.log(process.env.EMAILPASSWORD);
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.USEREMAIL,
        pass: process.env.EMAILPASSWORD
    }
  });

  var mailOptions = {
    from: '"Painting With Data Team" <' + process.env.USEREMAIL + '>',
    to: email,
    subject: 'Please confirm your account',
    html: 'Click the following link to confirm your account:</p><p>' + verificationLink + '</p>',
    text: 'Please confirm your account by clicking the following link: ${URL}'
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
      console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
};

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
              sendVerificationEmail(email, 'http://paintingwithdata.mit.edu/users/verify/' + id);
              return done(null, newUser, req.flash('signUpMessage', "We sent an email to you, please click the link to verify your account"));
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
  isAuthenticated : isAuthenticated
}
