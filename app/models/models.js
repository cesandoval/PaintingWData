// app/model/models.js
var UserMeta = require('./user.js'),
    DataayerMeta = require('./datalayer.js'),
    connection = require('../sequelize.js')
    


var User = connection.define('users', UserMeta.attributes, UserMeta.options)
var Datalayer = connection.define('datalayer', DataayerMeta.attributes, DataayerMeta.options)

// you can define relationships here

module.exports.User = User
module.exports.Datalayer = Datalayer