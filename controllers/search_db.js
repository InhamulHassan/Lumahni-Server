const express = require("express"),
  router = express.Router();
const search = require("../models/search_db");

router.route("/book/:titleQuery").get(search.searchBooksByTitle);
router.route("/book/isbn/:isbnQuery").get(search.searchBooksByISBN);
router.route("/book/isbn13/:isbn13Query").get(search.searchBooksByISBN13);
router.route("/author/:authorNameQuery").get(search.searchAuthorsByName);
router.route("/genre/:genreNameQuery").get(search.searchGenresByName);

module.exports = router;
