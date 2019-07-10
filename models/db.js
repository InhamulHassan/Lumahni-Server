const pgp = require('pg-promise')(); // requires the pg-promise interface for PostgresSQL
const config = require('../config');
const db = pgp(config.db); //creating the database by supplying the connection string

module.exports = db;
