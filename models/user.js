// // app/sequelize.js
// var Sequelize = require('sequelize'),
//     PassportLocalStrategy = require('passport-local').Strategy,
//     sequelize = new Sequelize('postgres://localhost:5432/PaintingWithData_Riyadh');


// app/model/User.js
var Sequelize = require('sequelize')

var attributes = {
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z0-9\_\-]+$/i,
    }
  },
  email: {
    type: Sequelize.STRING,
    validate: {
      isEmail: true
    }
  },
  firstName: {
    type: Sequelize.STRING,
  },
  lastName: {
    type: Sequelize.STRING,
  },
  password: {
    type: Sequelize.STRING,
  },
  salt: {
    type: Sequelize.STRING
  }
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options

// module.exports = sequelize




// var Sequelize = require('sequelize');
// var pg = require('pg').native;
// var PassportLocalStrategy = require('passport-local').Strategy;

// var sequelize = new Sequelize('postgres://localhost:5432/PaintingWithData_Riyadh');

// var User = sequelize.define('user', {
//   username: Sequelize.STRING,
//   password: Sequelize.STRING,
// });

// User.sync();


// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var passportLocalMongoose = require('passport-local-mongoose');

// var User = new Schema({
//     username: String,
//     password: String,
//     admin:   {
//         type: Boolean,
//         default: false
//     }
// });

// User.plugin(passportLocalMongoose);

// module.exports = mongoose.model('User', User);