'use strict';
module.exports = function(sequelize, DataTypes) {
var Datavoxel = sequelize.define('Datavoxel', {
    voxelname: {
      type: DataTypes.STRING,
      allowNull: false,
      },
    epsg: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bbox: {
      type: DataTypes.GEOMETRY,
      allowNull: true
    },
    processed: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    rowsCols: {
      type: DataTypes.JSON,
    },
    allIndices: {
      type: DataTypes.JSON,
    },
    ptDistance: {
      type: DataTypes.FLOAT,
    },
    public: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
    },
    voxelId: {
      type: DataTypes.STRING,
    },
}, {
    classMethods: {
      associate: function(models) {
        Datavoxel.belongsTo(models.User, {foreignKey: 'userId'});
        // Datavoxel.hasMany(models.Datafilevoxel, {foreignKey: 'DatavoxelId'});
        Datavoxel.belongsToMany(models.Datafile, {through: 'Datafilevoxel'});
        Datavoxel.hasOne(models.Datavoxelimage)//, {foreignKey: 'test'})
      }
    }
  });
  return Datavoxel;
};
