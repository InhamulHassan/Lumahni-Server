// Core Modules
const express = require('express'),
    app = express(); // requiring the express library to access the express app

// Security Modules
const cors = require('cors'); // requiring the cors to allow CORS during requests
app.use(cors()); // enabling all CORS request throughout the app

// Express Middleware
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use('/assets', express.static(__dirname + '/public')); // public/ directory is used to serve static assets

// Controllers
app.use(require('./controllers'));

// the express function to read a GET request with two arguments
// when it gets the route specified (we have specified the 'root' as the route)
//      - Request:  the details of the request URL 
//      - Response: the function that specifies the response  
app.get('/', (req, res) => {
    res.json({
        msg: 'This is CORS-enabled for all origins!',
        info: 'Node.js, Express, and Postgres API'
    });
});

module.exports = app;
