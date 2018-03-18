'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datadbf = sequelize.define('Datadbf', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    datalayerId:{
        type:DataTypes.INTEGER,
        allowNull: false
    },
    
    properties: {
      type: DataTypes.JSON,
      allowNull: true
    },
  }, {
    classMethods: {
      associate: function(models) {
        Datadbf.belongsTo(models.User, {foreignKey: 'userId'});
        Datadbf.belongsTo(models.Datalayer, {foreignKey: 'datalayerId'});
      }
    }
  });
  return Datadbf;
};