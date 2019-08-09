const express = require("express"),
  router = express.Router();
const genre = require("../models/genre_db");

router
  .route("/")
  .get(genre.getAllGenres)
  .post(genre.createGenre);

router
  .route("/:id")
  .get(genre.getGenreById)
  .put(genre.updateGenre)
  .delete(genre.deleteGenre);

router.route("/books/:id").get(genre.getBooksByGenre);

module.exports = router;
