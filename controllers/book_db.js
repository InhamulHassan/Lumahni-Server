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

router
  .route("/copy")
  .get(book.getAllBookCopies)
  .post(book.createBookCopy);

router
  .route("/copy/:id")
  .get(book.getBookCopiesById)
  .put(book.updateBookCopy)
  .delete(book.deleteBookCopy);

router
  .route("/copy/book/:book_id")
  .get(book.getBookCopiesByBookId)
  .delete(book.deleteBookCopyByBookId);

router
  .route("/copy/availability/:availability")
  .get(book.getBookCopiesByAvailability);

router.route("/copy/call/:call_number").get(book.getBookCopiesByCallNumber);

router.route("/copy/shelf/:shelf_code").get(book.getBookCopiesByShelfCode);

module.exports = router;
