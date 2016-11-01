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
        type: Sequelize.INTEGER,
        allowNull: false
      },
      datafileId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      layername: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userLayerName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      geometry: {
        type: Sequelize.GEOMETRY
      },
      properties: {
        type: Sequelize.JSON
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      epsg: {
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rasterProperty: {
        type: Sequelize.STRING,
        allowNull: true
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