// Core Modules
const express = require("express"),
  app = express(); // requiring the express library to access the express app
const cors = require("cors"); // requiring the cors to allow Cross Oigin Resource Sharing during requests
const jwt = require("./helpers/jwt"); // requiring the jwt helper method to authorize/protect the routes

app.use(jwt()); // use JWT auth to secure the api

// Security Modules
// specify the options to setup the CORS module
const whitelist = ["http://localhost:3000"];
const corsOptions = {
  origin: function(origin, callback) {
    //  allow requests with no origin (like mobile apps or curl requests)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  exposedHeaders: [
    "Content-Type",
    "Authorization",
    "Content-Length",
    "X-Requested-With"
  ],
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions)); // enabling all CORS request throughout the app

// Express Middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

app.use("/assets", express.static(__dirname + "/public")); // '/public' directory is used to serve static assets

// App route controllers
app.use(require("./controllers"));

// global error handler
app.use(require("./helpers/error_handler"));

// the express function to read the root GET request with two arguments
// when it gets the route specified (we have specified the 'root' as the route)
//      - Request:  the details of the request URL
//      - Response: the function that specifies the response
app.get("/", (req, res) => {
  res.json({
    msg: "This is CORS-enabled for some origins",
    info: "Node.js, Express, and Postgres API"
  });
});

// handle errors and extremities
app.use((request, response, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, request, response, next) => {
  response.status(error.status || 500);
  // error message doesnt have access control header
  response.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  response.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
