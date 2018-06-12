var host = process.env === 'production' ? 'pwd.cvyt4sv5tkgm.us-west-1.rds.amazonaws.com' : 'pwd-develop.cpynefgvbqsq.us-east-1.rds.amazonaws.com';

var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        logging: false,
        host: host, /*localhost*/
        dialect: 'postgres'
    })

module.exports = sequelize
