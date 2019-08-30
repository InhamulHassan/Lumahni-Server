const expressJwt = require("express-jwt");

module.exports = jwt;

function jwt() {
  const secret = process.env.SECRET_KEY;
  return expressJwt({ secret }).unless({
    path: [
      // public routes that don't require authentication
      "/user/auth",
      "/user/register",
      "/quote",
      // using regex to allow url parameters
      /^\/quote\/.*/,
      "/unsplash"
    ]
  });
}
