var host = process.env === 'production' ? '52.87.253.4' : 'localhost';

var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        host: host,
        dialect: 'postgres'
    })

module.exports = sequelize
