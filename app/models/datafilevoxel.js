'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datafilevoxel = sequelize.define('Datafilevoxel', {
    datavoxelId: DataTypes.INTEGER,
    datafileId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Datafilevoxel;
};