var Sequelize = require('sequelize'),
    Model = require('../models/models.js');

var attributes = {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  // userId: {
  //   type: Sequelize.INTEGER,
  //   references: {
  //     // This is a reference to another model
  //     model: 'users',
  //     // This is the column name of the referenced model
  //     key: 'id',
  //     // This declares when to check the foreign key constraint. PostgreSQL only.
  //     deferrable: Sequelize.Deferrable.INITIALLY_IMMEDIATE
  //   },
  //   allowNull: false
  // },
  layerName: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true,
  },
  geometry: {
    type: Sequelize.GEOMETRY,
    allowNull: false
  },
  properties: {
    type: Sequelize.STRING,
    allowNull: true
  },
  epsg: {
    type: Sequelize.INTEGER,
    allowNull: true
  },
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options

// 'use strict';

// var Q = require('q');

// module.exports = function (sequelize, DataTypes) {
//   return sequelize.define('Snapshot', {
//     time: {
//       type: DataTypes.DATE
//     }
//   }, {
//     instanceMethods: {
//       setGeoJson: function (geojson) {
//         var deferred = Q.defer();
//         sequelize.query('UPDATE "public"."Snapshots" SET geom= ST_GeomFromGeoJSON(\'' + geojson + '\') WHERE id=' + this.id).then(function (result) {
//           deferred.resolve(result);
//         }).catch(function (err) {
//           deferred.reject(err);
//         });
//         return deferred;
//       },
//       getGeoJson: function () {
//         var deferred = Q.defer();
//         sequelize.query('SELECT ST_AsGeoJSON(geom, 15, 2) FROM "public"."Snapshots" WHERE id =' + this.id).then(function (result) {
//           deferred.resolve(result);
//         }).catch(function (err) {
//           deferred.reject(err);
//         });
//         return deferred;
//       }
//     }
//   });
// };


// // In your DB Start Config file
//     sequelize.sync({
//       force: true
//     }).then(function () {
//       // Add the geometry column
//       sequelize.query('SELECT AddGeometryColumn(\'public\',\'Snapshots\',\'geom\',\'0\',\'MULTIPOLYGON\',2);').then(function () {
//         console.log('DEV: Postgres Database is synced.');
//         // Populate DB with sample data
//         if (config.database.seedDB) {
//           require('./seed');
//         }
//       }).catch(function (err) {
//         console.log('DEV: Error adding geometry column');
//       });
//     }).catch(function (err) {
//       console.log('DEV: Postgres Database is not synced.', err);
//     });