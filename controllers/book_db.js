const express = require("express"),
  router = express.Router();
const book = require("../models/book_db");

router
  .route("/")
  .get(book.getAllBooks)
  .post(book.createBook);

router
  .route("/:id")
  .get(book.getBookById)
  .put(book.updateBook)
  .delete(book.deleteBook);

router.route("/page/:page").get(book.getAllBooksByPage);

router.route("/grid/:grid").get(book.getBookByGRId);

router.route("/isbn/:isbn").get(book.getBookByISBN);

router.route("/isbn13/:isbn13").get(book.getBookByISBN13);

router.route("/isbn/:isbn13").get(book.getBookByISBN13);

router.route("/title/:title").get(book.getBookByTitle);

module.exports = router;
