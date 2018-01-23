pgp = require('pg-promise')();

const cn = {
        host: 'localhost',
        database: 'PaintingWithData_Riyadh',
        user: 'postgres',
        password: 'postgrespass'
    };

const db = pgp(cn);

module.exports = pgp