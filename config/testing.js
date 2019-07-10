module.exports = {
    env: 'testing',
    db: process.env.POSTGRES_URL_TESTING,
    port: process.env.PORT || 3400,
};
