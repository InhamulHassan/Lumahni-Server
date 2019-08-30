const fetch = require("node-fetch");

const defaultQuote = {
  quote:
    "It's a dangerous business, Frodo, going out your door. You step onto the road, and if you don't keep your feet, there's no knowing where you might be swept off to.",
  author: "J.R.R. Tolkien",
  publication: "The Fellowship of the Ring (The Lord of the Rings, #1)"
};

const fetchQuote = async (request, response) => {
  const tag = request.params.tag || getRandomTags();
  try {
    return response.status(200).send({
      //            quote: result.quotes[getRandomInt(0, 29)]
      quote: defaultQuote
    }); // success
//    return fetch(`https://goodquotesapi.herokuapp.com/tag/${tag}`);
//      .then(result => result.json())
//      .then(result => {
//        if (result.total_pages > 0) {
//          //chooses a random index from array
//          // some error with the API so getting the default quote
//          return response.status(200).send({
//            //            quote: result.quotes[getRandomInt(0, 29)]
//            quote: defaultQuote
//          }); // success
//        } else {
//          return response.status(200).send({
//            quote: defaultQuote
//          }); // success
//        }
//      });

  } catch (error) {
    console.log("Error generating quote, error: ", error);
    return response.status(200).send({
      quote: defaultQuote
    }); // success
  }
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomTags = () => {
  let tagArray = [
    "wisdom",
    "creativity",
    "ingenuity",
    "aspiration",
    "teaching",
    "spirituality",
    "calm",
    "goodness",
    "death",
    "life"
  ];
  return tagArray[Math.floor(Math.random() * tagArray.length)]; // chooses a random element from array
};

module.exports = { fetchQuote };
