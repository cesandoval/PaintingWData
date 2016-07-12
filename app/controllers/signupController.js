// var bcrypt = require('bcrypt'),
var Model = require('../models/models.js')

module.exports.show = function(req, res) {
  res.render('users/signUp')
}

module.exports.signup = function(req, res) {
  var username = req.body.username
  var password = req.body.password
  var password2 = req.body.password2
  
  if (!username || !password || !password2) {
    req.flash('error', "Please, fill in all the fields.")
    res.redirect('users/signUp')
  }
  
  if (password !== password2) {
    req.flash('error', "Please, enter the same password twice.")
    res.redirect('users/signUp')
  }
  
  // var salt = bcrypt.genSaltSync(10)
  // var hashedPassword = bcrypt.hashSync(password, salt)
  
  var newUser = {
    username: username,
    salt: 'some', //salt
    password: password//hashedPassword
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
  Model.User.findAll(
  {
    // where: { username: 'a' }
  }
  ).then(function(users){
      console.log('controller queries')
      console.log(users)
      console.log('adding and returning users')
  })
}
