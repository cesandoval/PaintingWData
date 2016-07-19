var Model = require('../models/models.js'),
    auth = require('passport-local-authenticate'),
    async = require('async');


module.exports.show = function(req, res) {
  res.render('users/signUp')
}

module.exports.signup = function(req, res) {
  var username = req.body.username,
      password = req.body.password,
      password2 = req.body.password2,
      email = req.body.email;

  if (!username || !password || !password2) {
    req.flash('error', "Please, fill in all the fields.")
    // res.redirect('users/signUp')
  }
  
  if (password !== password2) {
    req.flash('error', "Please, enter the same password twice.")
    // res.redirect('users/signUp')
  }

  var hashed_pass,
      salt;
  auth.hash(password, function(err, hashed) {
    hashed_pass = hashed.hash;
    salt = hashed.salt;

    var newUser = {
      username: username,
      email: email,
      salt: salt, 
      password: hashed_pass
    }
    Model.User.sync(
      {
        // force: true
      }).then(function () {
        // Table created
        return Model.User.create(newUser).then(function() {
          res.render('./users/registration_success')
          // return res.status(200).json({status: 'Registration Successful!'});
      }).catch(function(error) {
        console.log(error)
        req.flash('error', "Please, choose a different username.")
        res.redirect('/users/signup')
      })
    })
  });
  

  // var newUser = {
  //   username: username,
  //   salt: salt, 
  //   password: hashed_pass
  // }

  // Model.User.sync(
  //   {
  //     // force: true
  //   }).then(function () {
  //   // Table created
  //   return Model.User.create(newUser).then(function() {
  //     res.render('./users/registration_success')
  //     // return res.status(200).json({status: 'Registration Successful!'});
  //   }).catch(function(error) {
  //     console.log(error)
  //     req.flash('error', "Please, choose a different username.")
  //     res.redirect('/users/signup')
  //   })
  // })
  // Model.User.findAll(
  // {
  //   // where: { username: 'a' }
  // }
  // ).then(function(users){
  //     // console.log('controller queries')
  //     // console.log(users)
  //     // console.log('adding and returning users')
  // })
}

// Model.User.findAll(
// {
//   // where: { username: 'a' }
// }
// ).then(function(users){
//     console.log('controller queries')
//     console.log(users)
//     console.log('adding and returning users')
// })
