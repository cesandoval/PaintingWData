var User = require('../models').User,
    LocalStrategy = require('passport-local').Strategy,
    bcrypt = require('bcrypt-nodejs'),
    async = require('async');


module.exports.show = function(req, res) {
  res.render('users/signUp')
}


var signUpStrategy = 
  new LocalStrategy({
      passReqToCallback : true
    },
    function(req, email, password, done) {
       console.log('Here ===========================')
       console.log();
        
        User.findOne({
          where: {
            email: req.body.email
          },
          
        }).then(function(user) {
           if(user){
            return done(null, false, req.flash('error',"Email is already in use."));
           }
           else{
            console.log('Here ===========================')
            var newUser = User.build();
            newUser.email = req.body.email
            // generate hash by doing 10 rounds of salt. Is blocking.
            var hash = bcrypt.hashSync(req.body.password, 10); 
            newUser.password = hash;
            //console.log(newUser);
            newUser.save().then(function(){
              return done(null, newUser, req.flash('message', "User successfully registered."));
            });   
           }
           }, function(error){
            return done(null, false, req.flash('error', "User registration failed."));
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
          console.log("===========================================");
          console.log("User was found");
         
         if (bcrypt.compareSync(password, user.password)){
          console.log("===========================================");
          console.log("and password was correct");
          return done(null, user, req.flash('message', "user successfully logged in"));
         }
         else{
          console.log("===========================================");
          console.log("But password was invalid");
          return done(null, false, req.flash('error', "invalid password"));
         }
       }
       else{
        console.log("===========================================");
        console.log("no the user wasnt found");
        return done(null, false, req.flash('error', "invalid email"));
       }
       },  // do the above if succeeded 
       function(error){
        return done(null, false, req.flash('error', "login failed"));
       }// do this if failed.
    ); 

  });

var isAuthenticated = function (req, res, next) {
  if (req.isAuthenticated())
    return next();
  res.redirect('/users/login');
}

module.exports = {
  LoginStrategy : loginStrategy,
  SignUpStrategy : signUpStrategy,
  isAuthenticated : isAuthenticated
}

// module.exports.signup = function(req, res) {
//   var username = req.body.username,
//       password = req.body.password,
//       password2 = req.body.password2,
//       email = req.body.email;

//   if (!username || !email || !password || !password2) {
//     req.flash('error', "Please, fill in all the fields.")
//     res.redirect('users/signUp')
//   }
  
//   if (password !== password2) {
//     req.flash('error', "Please, enter the same password twice.")
//     res.redirect('users/signUp')
//   }

//   var hashed_pass,
//       salt;
//   auth.hash(password, function(err, hashed) {
//     hashed_pass = hashed.hash;
//     salt = hashed.salt;

//     var newUser = {
//       username: username,
//       email: email,
//       salt: salt, 
//       password: hashed_pass
//     }
//     Model.User.sync(
//       {
        
//       }).then(function () {
//         // Table created
//         return Model.User.create(newUser).then(function() {
//           res.render('./users/registration_success')
//           // return res.status(200).json({status: 'Registration Successful!'});
//       }).catch(function(error) {
//         console.log(error)
//         req.flash('error', "Please, choose a different username.")
//         res.redirect('/users/signUp')
//       })
//     })
//   });
// }