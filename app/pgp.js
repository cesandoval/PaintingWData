var pgp = require('pg-promise')();
	//config = require('./config.json');
var host = process.env.NODE_ENV === 'production' ? 'pwd.cvyt4sv5tkgm.us-west-1.rds.amazonaws.com' : 'pwd-develop.cpynefgvbqsq.us-east-1.rds.amazonaws.com';
console.log(host, process.env.NODE_ENV)
const cn = {
        host: host,
        database: 'PaintingWithData_Riyadh',
        user: 'postgres',
        password: 'postgrespass'
    };

const db = pgp(cn);

module.exports = pgp