'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datavoxel = sequelize.define('Datavoxel', {
    voxelname: {
      type: DataTypes.STRING,
      allowNull: false,
      },
    epsg: DataTypes.INTEGER
}, {
    classMethods: {
      associate: function(models) {
        Datavoxel.belongsTo(models.User, {foreignKey: 'userId'});
        Datavoxel.hasMany(models.Datafile, {foreignKey: 'datafileId'});
      }
    }
  });
  return Datavoxel;
};