'use strict';
module.exports = function(sequelize, DataTypes) {
var Datavoxel = sequelize.define('Datavoxel', {
    voxelname: {
      type: DataTypes.STRING,
      allowNull: false,
      },
    epsg: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bbox: {
      type: DataTypes.GEOMETRY,
      allowNull: true
    },
}, {
    classMethods: {
      associate: function(models) {
        Datavoxel.belongsTo(models.User, {foreignKey: 'userId'});
        // Datavoxel.belongsToMany(models.Datafile, {through: 'Datfilevoxel'});
      }
    }
  });
  return Datavoxel;
};