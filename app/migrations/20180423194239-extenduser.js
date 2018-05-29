'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

   queryInterface.addColumn('Users',
   'use',
   {
       type: Sequelize.TEXT,
   })

   queryInterface.addColumn('Users',
   'industry',
   {
       type: Sequelize.STRING,
   })

   queryInterface.addColumn('Users',
   'referal',
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
  }
};