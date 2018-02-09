'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    queryInterface.addColumn('Users',
    'paidUser',
    {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    })

    queryInterface.addColumn('Users',
    'uploadsSize',
    {
        type: Sequelize.DECIMAL,
        defaultValue: 0.0
    })
    
  },

  down: function (queryInterface, Sequelize) {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};

