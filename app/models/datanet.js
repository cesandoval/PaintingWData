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
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datavoxelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    neighborhood: {
      type: DataTypes.JSON,
    }
  }, {
    classMethods: {
      associate: function(models) {
        Datanet.belongsTo(models.User, {foreignKey: 'userId'});
        Datanet.belongsTo(models.Datavoxel, {foreignKey: 'voxelId'});
        // Datanet.hasMany(models.Datafile, {foreignKey: 'datafileId'});
        // Datanet.hasOne(models.Datavoxel, {foreignKey: 'datavoxelId'});
      }
    }
  });
  return Datanet;
};
