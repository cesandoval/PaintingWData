var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    auth = require('passport-local-authenticate'),
    Model = require('./models/models.js');

module.exports = function(app) {
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy(
    function(username, password, done) {
      Model.User.findOne({
        where: {
          'username': username
        }
      }).then(function (user) {
        if (user == null) {
          return done(null, false, { message: 'Incorrect credentials.' })
        }
        var vals = user.dataValues;
        var preHashed = {
          salt: vals.salt,
          hash: vals.password
        }

        auth.verify(password, preHashed, function(err, verified) {
          if (verified) {
            console.log('this user worked.....')
            return done(null, user, { message: 'Checking the login funcs, it actually logs in' })
          } else {
            return done(null, false, { message: 'Please try again' })
          }
        });
      })
    }
  ))

  passport.serializeUser(function(user, done) {
    done(null, user.id)
  })

  passport.deserializeUser(function(id, done) {
    Model.User.findOne({
      where: {
        'id': id
      }
    }).then(function (user) {
      if (user == null) {
        done(new Error('Wrong user id.'))
      }
      
      done(null, user)
    })
  })
}