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