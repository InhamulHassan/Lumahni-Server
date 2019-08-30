const jwt = require("jsonwebtoken");

function authorizeToken(request, response, next) {
  const bearerHeader = request.header["Authorization"];
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    jwt.verify(bearerToken, process.env.SECRET_KEY, function(error, data) {
      if (!error) {
        next();
      } else {
        response.status(403).send({
          message: "Access Forbidden"
        });
      }
    });
  } else {
    response.status(403).send({
      message: "Invalid token"
    }); // success
  }
}

module.exports = authorizeToken;
