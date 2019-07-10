require('dotenv').config(); //requiring the .env file containing the config key-value pairs
var env = process.env.NODE_ENV || "development";
var config = require('./development') || require(`./${env}`);

module.exports = config;
