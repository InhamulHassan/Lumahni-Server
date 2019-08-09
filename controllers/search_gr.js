const express = require("express"),
  router = express.Router();
const graphqlHTTP = require("express-graphql");
const DataLoader = require("dataloader");
const schema = require("../typedefs/search_type");
const {
  searchBooksByTitle,
  searchBooksByAuthorName,
  searchBooksByISBN,
  searchBooksByGenre
} = require("../models/search_gr");

// Data loader to enable batch caching of response
const searchBooksByTitleLoader = new DataLoader(titles =>
  Promise.all(titles.map(searchBooksByTitle))
);
const searchBooksByAuthorNameLoader = new DataLoader(names =>
  Promise.all(names.map(searchBooksByAuthorName))
);
const searchBooksByISBNLoader = new DataLoader(isbns =>
  Promise.all(isbns.map(searchBooksByISBN))
);
const searchBooksByGenreLoader = new DataLoader(genres =>
  Promise.all(genres.map(searchBooksByGenre))
);

router.use(
  "/",
  graphqlHTTP(_req => {
    return {
      graphiql: true,
      schema,
      context: {
        searchBooksByTitleLoader,
        searchBooksByAuthorNameLoader,
        searchBooksByISBNLoader,
        searchBooksByGenreLoader
      }
    };
  })
);

module.exports = router;
