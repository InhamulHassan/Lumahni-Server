const express = require("express"),
  router = express.Router();
const photo = require("../helpers/unsplash_photos");

// allow users to specify/not specify a custom tag
router.route("/").get(photo.fetchRandomImage);

module.exports = router;
