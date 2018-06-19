// 'use strict';

// module.exports = {
//   up: (queryInterface, Sequelize) => {
//     /*
//       Add altering commands here.
//       Return a promise to correctly handle asynchronicity.

//       Example:
//       return queryInterface.createTable('users', { id: Sequelize.INTEGER });
//     */
//     return queryInterface.createTable('Datauserfiles', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER
//       },
//       state: {
//         type: Sequelize.JSON
//       },
//       datavoxelId: {
//         type: Sequelize.INTEGER//whatever the hash is. it's a string!
//       },
//       userId: {
//         type: Sequelize.INTEGER//whatever the hash is. it's a string!
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE
//       }
//     });
//   },

//   down: (queryInterface, Sequelize) => {
//     /*
//       Add reverting commands here.
//       Return a promise to correctly handle asynchronicity.

//       Example:
//       return queryInterface.dropTable('users');
//     */
//   }
// };
