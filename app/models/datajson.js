'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datajson = sequelize.define('Datajson', {
    layername: {
      type: DataTypes.STRING,
      allowNull: false,
      
      },
    layerids: {
        type: DataTypes.STRING,
        allowNull: false,
       
      },
    geojson: DataTypes.JSON,
    epsg: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Datajson;
};