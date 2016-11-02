'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datanet = sequelize.define('Datanet', {
    voxelname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    geometry: {
      type: DataTypes.GEOMETRY,
      allowNull: true
    },
    epsg: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        Datanet.belongsTo(models.User, {foreignKey: 'userId'});
        // Datanet.hasMany(models.Datafile, {foreignKey: 'datafileId'});
        // Datanet.hasOne(models.Datavoxel, {foreignKey: 'datavoxelId'});
      }
    }
  });
  return Datanet;
};