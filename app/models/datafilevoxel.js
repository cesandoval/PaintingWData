'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datafilevoxel = sequelize.define('Datafilevoxel', {
    DatavoxelId: DataTypes.INTEGER,
    DatafileId: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models) {
        Datafilevoxel.belongsTo(models.Datavoxel, {foreignKey: 'DatavoxelId'});
        Datafilevoxel.belongsTo(models.Datafile, {foreignKey: 'DatafileId'});
        // Datafilevoxel.hasMany(models.Datafile, {foreignKey: 'datafileId'});
        // associations can be defined here
      }
    }
  });
  return Datafilevoxel;
};