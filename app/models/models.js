var UserMeta = require('./user.js'),
    DataFileMeta = require('./datafile.js'),
    DataLayerMeta = require('./datalayer.js'),
    DataNetMeta = require('./datanet.js'),
    DataJSONMeta = require('./datajson.js'),
    // DataRasterMeta = require('./dataraster.js'),
    connection = require('../sequelize.js');   

var User = connection.define('users', UserMeta.attributes, UserMeta.options);
var DataFile = connection.define('datafile', DataFileMeta.attributes, DataFileMeta.options);
var DataLayer = connection.define('datalayer', DataLayerMeta.attributes, DataLayerMeta.options);
var DataNet = connection.define('datanet', DataNetMeta.attributes, DataNetMeta.options);
// var DataRaster = connection.define('dataraster', DataRasterMeta.attributes, DataRasterMeta.options)
var DataJSON = connection.define('datajson', DataJSONMeta.attributes, DataJSONMeta.options);

// you can define relationships here
User.hasMany(DataFile);

connection.sync(
    // {force: true, match: /_Riyadh$/}
)

// Create Spatial Index to a model
var raw_query = 'CREATE INDEX geometry ON datalayer USING GIST (geometry);'
// connection.query(raw_query).spread(function(results, metadata){
//     console.log(results);
//     console.log(metadata);//
// })

// Vacumm analize the whole DB
var vacumm = 'VACUUM ANALYZE datalayer;'
// connection.query(vacumm).spread(function(results, metadata){
//     console.log(results);
//     console.log(metadata);
// })//

// User.findAll(
//     // {where: { 
//     //     name: 'A Project' 
//     // }}
//   ).then(function(users){
//     console.log(users)
//     console.log('testing some get queries 1')
// })


module.exports.User = User;
module.exports.DataFile = DataFile;
module.exports.DataLayer = DataLayer;
module.exports.DataNet = DataNet;
module.exports.DataJSON = DataJSON;
// module.exports.DataRaster = DataRaster;