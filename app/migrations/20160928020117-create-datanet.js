// 'use strict';
// module.exports = {
//   up: function(queryInterface, Sequelize) {
//     return queryInterface.createTable('Datanets', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER
//       },
//       voxelname: {
//         type: Sequelize.STRING,
//         allowNull: false
//       },
//       userId: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//       },
//       datafileId: {
//         type: Sequelize.STRING,
//         allowNull: true
//       },
//       datavoxelId: {
//         type: Sequelize.INTEGER,
//         allowNull: true
//       },
//       geometry: {
//         type: Sequelize.GEOMETRY
//       },
//       epsg: {
//         type: Sequelize.INTEGER
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
//   down: function(queryInterface, Sequelize) {
//     return queryInterface.dropTable('Datanets');
//   }
// };
'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Datanets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      layername: {
        type: Sequelize.STRING,
        allowNull: false
      },
      layerids: {
        type: Sequelize.STRING,
        allowNull: false
      },
      geometry: {
        type: Sequelize.GEOMETRY
      },
      epsg: {
        type: Sequelize.INTEGER
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
    return queryInterface.dropTable('Datanets');
  }
};