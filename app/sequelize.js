var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        host: '52.87.253.4',
        dialect: 'postgres'
    })

module.exports = sequelize
