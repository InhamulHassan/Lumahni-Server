const express = require("express"),
  router = express.Router();
const author = require("../models/author_db");

router
  .route("/")
  .get(author.getAllAuthors)
  .post(author.createAuthor);

router
  .route("/:id")
  .get(author.getAuthorById)
  .put(author.updateAuthor)
  .delete(author.deleteAuthor);

router.route("/grid/:grid").get(author.getAuthorByGRId);

router.route("/name/:name").get(author.getAuthorByName);

router.route("/books/:id").get(author.getBooksByAuthor);

module.exports = router;
