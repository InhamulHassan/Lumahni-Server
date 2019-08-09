const express = require("express"),
  router = express.Router();
const graphqlHTTP = require("express-graphql");
const DataLoader = require("dataloader");
const schema = require("../typedefs/book_type");
const {
  getBookByGRId,
  getBookByISBN,
  getBookByTitle,
  getBookByAuthor
} = require("../models/book_gr");

// Data loader to enable batch caching of response
const getBookByGRIdLoader = new DataLoader(GRIds =>
  Promise.all(GRIds.map(getBookByGRId))
);
const getBookByISBNLoader = new DataLoader(isbns =>
  Promise.all(isbns.map(getBookByISBN))
);
const getBookByTitleLoader = new DataLoader(titles =>
  Promise.all(titles.map(getBookByTitle))
);

router.use(
  "/",
  graphqlHTTP(_req => {
    return {
      graphiql: true,
      schema,
      context: {
        getBookByGRIdLoader,
        getBookByISBNLoader,
        getBookByTitleLoader
      }
    };
  })
);

module.exports = router;
