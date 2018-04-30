'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
      },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    urlLink: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    paidUser:{
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    uploadsSize:{
      type: DataTypes.DECIMAL,
      defaultValue: 0.0
    },
    use:{
      type: DataTypes.TEXT,
    },
    industry:{
      type: DataTypes.STRING,
    }, 
    referal:{
      type: DataTypes.STRING,
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Datafile, {foreignKey: 'userId'});
        User.hasMany(models.Datalayer, {foreignKey: 'userId'});
      }
    }
  });
  return User;
};