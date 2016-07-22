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
  layername: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true,
  },
  layerids: {
    type: Sequelize.STRING,
    allowNull: false,
    // unique: true,
  },
  geometry: {
    type: Sequelize.GEOMETRY,
    allowNull: true
  },
  epsg: {
    type: Sequelize.INTEGER,
    allowNull: true
  }
}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options