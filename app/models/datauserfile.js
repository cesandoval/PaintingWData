'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datauserfile = sequelize.define('Datauserfile', {
    //insert attributes here
    state: DataTypes.JSON, //the hash type!
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Datauserfile.belongsTo(models.Datavoxel, {foreignKey: 'voxelId'});
        Datauserfile.belongsTo(models.User, {foreignKey: 'userId'});
      }
    }
  });
  return Datauserfile;
};
