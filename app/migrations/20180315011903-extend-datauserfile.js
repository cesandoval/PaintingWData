'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('Datauserfile',
    'state',
    {
        type: Sequelize.JSON,
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.addColumn('Datauserfile',
    'map',
    {
        type: Sequelize.JSON,
    })

    queryInterface.addColumn('Datauserfile',
    'options',
    {
        type: Sequelize.JSON,
    })

    queryInterface.addColumn('Datauserfile',
    'UPL',
    {
        type: Sequelize.JSON,
    })

    queryInterface.addColumn('Datauserfile',
    'datavoxelId',
    {
        type: Sequelize.STRING,
    })
  }
};
