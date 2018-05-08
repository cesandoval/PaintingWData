var host = process.env.NODE_ENV === 'production' ? 'pwd.cvyt4sv5tkgm.us-west-1.rds.amazonaws.com' : 'localhost';
console.log(host)
var Sequelize = require('sequelize'),
    sequelize = new Sequelize('PaintingWithData_Riyadh', 'postgres', 'postgrespass', {
        logging: false,
        host: 'localhost', /*host,*/
        dialect: 'postgres'
    })

module.exports = sequelize
