'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('Datajsons',
    'hashVoxelId',
    {
        type: Sequelize.STRING,
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.addColumn('Datavoxels',
    'voxelId',
    {
        type: Sequelize.STRING,
    })
  }
};