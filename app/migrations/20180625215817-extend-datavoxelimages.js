'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    queryInterface.addColumn('Datavoxelimages',
        'public',
        {
            type: Sequelize.BOOLEAN,
        })

    queryInterface.addColumn('Datavoxelimages',
        'preview',
        {
            type: Sequelize.BOOLEAN,
        })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    queryInterface.removeColumn('Datavoxelimages','deleted')
  }
};
