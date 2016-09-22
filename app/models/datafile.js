var Sequelize = require('sequelize'),
    Model = require('../models/models.js');

var attributes = {
  id: {
    autoIncrement: true,
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  filename: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: false,
  },
  location: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
  },
  epsg: {
    type: Sequelize.INTEGER,
    allowNull: true,
    unique: true,
  },

}

var options = {
  freezeTableName: true
}

module.exports.attributes = attributes
module.exports.options = options


