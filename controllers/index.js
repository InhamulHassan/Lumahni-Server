var express = require('express'),
    router = express.Router();

//console.log('controller index');
router.use('/genre', require('./genre')); //requiring the genre controller

module.exports = router
