const fetch = require("node-fetch");
const { promisify } = require("util");
const parseXML = promisify(require("xml2js").parseString);
const key = process.env.GOODREADS_API_KEY;

function fetchGR(endpoint, q = "") {
  try {
    return fetch(
      `https://www.goodreads.com/${endpoint}?${q}${
        q.length ? "&" : ""
      }key=${key}`
    )
      .then(res => res.text())
      .then(parseXML)
      .then(res => {
        const { error, GoodreadsResponse } = res;
        if (error) {
          return Promise.reject(new Error(error));
        }

        return GoodreadsResponse;
      });
  } catch (err) {
    throw err; // error
  }
}

module.exports = fetchGR;
