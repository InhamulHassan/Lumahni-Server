const express = require("express"),
  router = express.Router();
const graphqlHTTP = require("express-graphql");
const DataLoader = require("dataloader");
const schema = require("../typedefs/author_type");
const {
  getAuthorByName,
  getAuthorById,
  getAllBooksByAuthorId
} = require("../models/author_gr");

// Data loader to enable batch caching of response
const getAuthorByIdLoader = new DataLoader(ids =>
  Promise.all(ids.map(getAuthorById))
);
const getAuthorByNameLoader = new DataLoader(names =>
  Promise.all(names.map(getAuthorByName))
);
const getAllBooksByAuthorIdLoader = new DataLoader(ids =>
  Promise.all(ids.map(getAllBooksByAuthorId))
);

router.use(
  "/",
  graphqlHTTP(_req => {
    return {
      graphiql: true,
      schema,
      context: {
        getAuthorByIdLoader,
        getAuthorByNameLoader,
        getAllBooksByAuthorIdLoader
      }
    };
  })
);

module.exports = router;
