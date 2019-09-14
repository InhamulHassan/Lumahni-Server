module.exports = {
  env: "development",
  db: process.env.POSTGRES_URL_DEVELOPMENT,
  port: process.env.PORT || 3030
};
