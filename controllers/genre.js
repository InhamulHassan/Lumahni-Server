var express = require('express'),
    router = express.Router(),
    genre = require('../models/genre');

//console.log('inside genre controller');
router.route('/')
    .get(genre.getAllGenres)
    .post(genre.createGenre);

router.route('/:id')
    .get(genre.getGenreById)
    .put(genre.updateGenre)
    .delete(genre.deleteGenre);

module.exports = router
