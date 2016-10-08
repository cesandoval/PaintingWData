'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datalayer = sequelize.define('Datalayer', {
    layername: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: false,
    },
    geometry: {
      type: DataTypes.GEOMETRY,
      allowNull: true
    },
    properties: {
      type: DataTypes.JSON,
      allowNull: true
    },
    epsg: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    rasterval: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    userlayername: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    classMethods: {
      associate: function(models) {
        
      }
    }
  });
  return Datalayer;
};