var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    // bcrypt = require('bcrypt'),
    Model = require('./models/models.js')

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
        
        // var hashedPassword = bcrypt.hashSync(password, user.salt)
        
        // if (user.password === hashedPassword) {
        //   return done(null, user)
        // }
        if (user.password === password) {
          // console.log('this worked.....')
          return done(null, user, { message: 'Checking the login funcs, it actually logs in' })
        }
        
        // console.log(user);
        return done(null, false, { message: 'Checking the login funcs' })
        // return done(null, user)
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