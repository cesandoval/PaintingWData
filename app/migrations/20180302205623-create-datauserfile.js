'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    // return queryInterface.createTable('Datauserfiles', {
    //   map: {
    //     type: Sequelize.JSON
    //   },
    //   options: {
    //     type: Sequelize.JSON
    //   },
    //   UPL: {
    //     type: Sequelize.JSON
    //   },
    //   datavoxelId: {
    //     type: Sequelize.STRING//whatever the hash is. it's a string!
    //   }
    // });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
