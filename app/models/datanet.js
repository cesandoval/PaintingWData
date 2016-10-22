'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datanet = sequelize.define('Datanet', {
    layername: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    layerids: {
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
    }
  }, {
    classMethods: {
      associate: function(models) {
        
      }
    }
  });
  return Datanet;
};