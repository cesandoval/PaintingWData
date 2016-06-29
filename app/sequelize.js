var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        host: 'localhost',
        dialect: 'postgres'
    })

module.exports = sequelize