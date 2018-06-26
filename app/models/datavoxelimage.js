'use strict';
module.exports = function(sequelize, DataTypes) {
  var Datavoxelimage = sequelize.define('Datavoxelimage', {
     DatavoxelId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      public: {
        type: DataTypes.BOOLEAN,
      },
      preview: {
        type: DataTypes.BOOLEAN,
      },
  }, {
    classMethods: {
      associate: function(models) {
        // Datavoxelimage.belongsTo(models.User, {foreignKey: 'userId'});
        Datavoxelimage.belongsTo(models.Datavoxel)//, {foreignKey: 'voxelId'});
      }
    }
  });
  return Datavoxelimage;
};