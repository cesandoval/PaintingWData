'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Datalayers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      layername: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      geometry: {
        type: Sequelize.GEOMETRY
      },
      properties: {
        type: Sequelize.JSON
      },
      epsg: {
        type: Sequelize.INTEGER
      },
      rasterval: {
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable('Datalayers');
  }
};