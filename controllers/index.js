const express = require("express"),
  router = express.Router();

//console.log('controller index');
router.use("/genre", require("./genre_db")); //requiring the genre_db controller
router.use("/author", require("./author_db")); //requiring the author_db controller
router.use("/book", require("./book_db")); //requiring the book_db controller
router.use("/search", require("./search_db")); //requiring the book_db controller
router.use("/author_gr", require("./author_gr")); //requiring the author_gr controller
router.use("/book_gr", require("./book_gr")); //requiring the book_gr controller
router.use("/search_gr", require("./search_gr")); //requiring the search_gr controller

module.exports = router;
