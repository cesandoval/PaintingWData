'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datalayer = sequelize.define('Datalayer', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datafileId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
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
    rasterProperty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rasterval: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    userLayerName: {
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
    deleted: {
      type: DataTypes.BOOLEAN,
    },
  }, {
    classMethods: {
      associate: function(models) {
        Datalayer.belongsTo(models.User, {foreignKey: 'userId'});
        Datalayer.belongsTo(models.Datafile, {foreignKey: 'datafileId'});
        Datalayer.hasOne(models.Datadbf, {foreignKey: 'userId'});        
      }
    }
  });
  return Datalayer;
};