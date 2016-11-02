'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datajson = sequelize.define('Datajson', {
    layername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    geojson: DataTypes.JSON,
    epsg: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER
    },
    datafileId: {
      type: DataTypes.INTEGER
    }
  }, {
    classMethods: {
      associate: function(models) {
        Datajson.belongsTo(models.User, {foreignKey: 'userId'});
        Datajson.belongsTo(models.Datafile, {foreignKey: 'datafileId'});
        // Datajson.hasOne(models.Datavoxel, {foreignKey: 'datavoxelId'});
      }
    }
  });
  return Datajson;
};