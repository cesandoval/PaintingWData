var pgp = require('pg-promise')();
	//config = require('./config.json');

const cn = {
        host: 'localhost',
        database: 'PaintingWithData_Riyadh',
        user: 'postgres',
        password: 'postgrespass'
    };

const db = pgp(cn);

module.exports = pgp