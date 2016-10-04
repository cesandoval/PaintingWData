'use strict';
module.exports = function(sequelize, DataTypes) {
  var Dataraster = sequelize.define('Dataraster', {
    layername: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    raster: {
      type: "raster",
      allowNull: false
    },
    srs: {
      type: DataTypes.INTEGER,
    },
  }, {
    getterMethods: {
      layerRelationship: function()  { 
          return 'DataRaster ' + this.layername + ' is related to DataLayer' + this.layerId 
      }
    },
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return Dataraster;
};