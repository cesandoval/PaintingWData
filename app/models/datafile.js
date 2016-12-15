'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datafile = sequelize.define('Datafile', {
     filename: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      epsg: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER
      }
  }, {

    classMethods: {
      associate: function(models) {
        Datafile.belongsTo(models.User, {foreignKey: 'userId'});
        Datafile.hasMany(models.Datalayer, {foreignKey: 'datafileId'});
        Datafile.belongsToMany(models.Datavoxel, {through: 'Datafilevoxel'});

      }
    }
  });
  return Datafile;
};