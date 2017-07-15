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
      geometry: {
        type: Sequelize.GEOMETRY
      },
      properties: {
        type: Sequelize.JSON
      },
      epsg: {
        type: Sequelize.INTEGER
      },
      rasterProperty: {
        type: Sequelize.STRING,
        allowNull: true
      },
      rasterval: {
        type: Sequelize.FLOAT
      },
      userLayerName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deleted: {
        type: Sequelize.BOOLEAN,
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