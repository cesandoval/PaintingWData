'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
      queryInterface.addColumn('Datajsons',
          'color1',
          {
              type: Sequelize.STRING,
              defaultValue: '#00ff00'
          })

      queryInterface.addColumn('Datajsons',
          'color2',
          {
              type: Sequelize.STRING,
              defaultValue: '#0000ff'
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
