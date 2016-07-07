// app/model/models.js
var UserMeta = require('./user.js'),
    DataLayerMeta = require('./datalayer.js'),
    connection = require('../sequelize.js')   

var User = connection.define('users', UserMeta.attributes, UserMeta.options)
var DataLayer = connection.define('datalayer', DataLayerMeta.attributes, DataLayerMeta.options)

// you can define relationships here


connection.sync({force: true, match: /_Riyadh$/})

User.findAll(
    // {where: { 
    //     name: 'A Project' 
    // }}
  ).then(function(users){
    console.log(users)
    console.log('testing some get queries 1')
})

// sequelize.query('SELECT...').spread(function (results, metadata) {
//   // Raw query - use spread
// });


module.exports.User = User
module.exports.Datalayer = DataLayer