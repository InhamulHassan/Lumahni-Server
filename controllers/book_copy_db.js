const express = require("express"),
  router = express.Router();
const copy = require("../models/book_copy_db");

router
  .route("/")
  .get(copy.getAllBookCopies)
  .post(copy.createBookCopy);

router
  .route("/:id")
  .get(copy.getBookCopyById)
  .put(copy.updateBookCopy)
  .delete(copy.deleteBookCopy);

router
  .route("/availability/:availability")
  .get(copy.getBookCopiesByAvailability);

router.route("/availability/:id").put(copy.toggleBookCopyAvailability);

router.route("/call/:call_number").get(copy.getBookCopyByCallNumber);

router
  .route("/book/:book_id")
  .get(copy.getBookCopiesByBookId)
  .delete(copy.deleteBookCopyByBookId);

router.route("/shelf/:shelf_code").get(copy.getBookCopiesByShelfCode);

module.exports = router;
