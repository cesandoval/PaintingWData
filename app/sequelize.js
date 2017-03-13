var host = process.env === 'production' ? '54.227.111.118' : 'localhost';

var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        host: '54.227.111.118',
        dialect: 'postgres'
    })

module.exports = sequelize
