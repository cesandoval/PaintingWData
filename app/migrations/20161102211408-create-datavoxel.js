'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Datavoxels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      voxelname: {
        type: Sequelize.STRING,
        allowNull: false
      },
      epsg: {
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bbox: {
        type: Sequelize.GEOMETRY,
        allowNull: true
      },
      processed: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      rowsCols: {
        type: Sequelize.JSON,
      },
      allIndices: {
        type: Sequelize.JSON,
      },
      ptDistance: {
        type: Sequelize.FLOAT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Datavoxels');
  }
};