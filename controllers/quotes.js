const express = require("express"),
  router = express.Router();
//const quote = require("../helpers/fetch_quotes");
const quote = require("../helpers/fetch_gr_quotes");

// allow users to specify/not specify a custom tag
router.route("/").get(quote.fetchQuote);
router.route("/:tag").get(quote.fetchQuote);

module.exports = router;
