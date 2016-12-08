'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datafilevoxel = sequelize.define('Datafilevoxel', {
    datavoxelId: DataTypes.INTEGER,
    datafileId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Datafilevoxel.belongsTo(models.Datavoxel, {foreignKey: 'datavoxelId'});
        // Datafilevoxel.hasMany(models.Datafile, {foreignKey: 'datafileId'});
        // associations can be defined here
      }
    }
  });
  return Datafilevoxel;
};