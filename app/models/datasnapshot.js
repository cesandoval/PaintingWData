'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datasnapshot = sequelize.define('Datasnapshot', {
    datavoxelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
  }, {
    classMethods: {
      associate: function(models) {
        // Datavoxelimage.belongsTo(models.User, {foreignKey: 'userId'});
        Datasnapshot.belongsTo(models.Datavoxel, {foreignKey: 'datavoxelId'});
      }
    }
  });
  return Datasnapshot;
};