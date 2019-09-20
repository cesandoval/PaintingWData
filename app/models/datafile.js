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
      },
      bbox: {
        type: DataTypes.GEOMETRY,
        allowNull: true
      },
      centroid: {
        type: DataTypes.GEOMETRY,
        allowNull: true
      },
      deleted: {
        type: DataTypes.BOOLEAN,
      },
      geometryType: {
        type: DataTypes.STRING,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      public: {
        type: DataTypes.BOOLEAN
      },
      userFileName: {
        type: DataTypes.STRING,
        allowNull: true
      },
  }, {

    classMethods: {
      associate: function(models) {
        Datafile.belongsTo(models.User, {foreignKey: 'userId'});
        Datafile.hasMany(models.Datalayer, {foreignKey: 'datafileId'});
        Datafile.hasMany(models.Datadbf, {foreignKey: 'datafileId'});
        Datafile.belongsToMany(models.Datavoxel, {through: 'Datafilevoxel'});
        Datafile.hasMany(models.Datafiletag, {foreignKey: 'datafileId'});

      }
    }
  });
  return Datafile;
};