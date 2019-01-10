'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datauserfile = sequelize.define('Datauserfile', {
    //insert attributes here
    //data saved from the client, usually a React.js state
    data: DataTypes.JSON, 
    datavoxelId: DataTypes.INTEGER,
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Datauserfile.belongsTo(models.Datavoxel, {foreignKey: 'datavoxelId'});
      }
    }
  });
  return Datauserfile;
};
