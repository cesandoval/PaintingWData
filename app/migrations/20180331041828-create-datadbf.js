'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Datadbfs', {
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
      datalayerId:{
          type: Sequelize.INTEGER,
          allowNull: false
      },
      properties: {
        type: Sequelize.JSON,
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
    }
  );
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Datadbfs');
  }
};