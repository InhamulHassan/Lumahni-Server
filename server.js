const config = require('./config'); // requiring the config file containing environment variables
const port = config.port;
const env = config.env;

const app = require('./app'); // requiring the app (Express object) object from app.js 

// Error Handlers for common errors
//if (process.listeners('unhandledRejection').length < 1) {
//    process.on('unhandledRejection', (reason, promise) => {
//        console.error(reason)
//        process.exit(1)
//    })
//}
//
//if (process.listeners('uncaughtException').length < 1) {
//    process.on('uncaughtException', function (err) {
//        console.error(err)
//        process.exit(1)
//    })
//}


// this will bind the application to the port listed on our local machine (or server)
app.listen(port, () => {
    console.log(`The app is running on port ${env}:${port}`)
});
