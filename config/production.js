module.exports = {
    env: 'production',
    db: process.env.POSTGRES_URL,
    port: process.env.PORT || 4000,
};
