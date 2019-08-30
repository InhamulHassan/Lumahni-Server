const Unsplash = require("unsplash-js").default;
const fetch = require("node-fetch");
global.fetch = fetch;

const unsplash = new Unsplash({
  applicationId: process.env.UNSPLASH_ACCESS_KEY,
  secret: process.env.UNSPLASH_SECRET_KEY
});

const fetchRandomImage = async (request, response) => {
  try {
    return unsplash.photos
      .getRandomPhoto({ collections: ["8368764"] })
      .then(res => res.json())
      .then(json => {
        return response.status(200).json(json); // success
      });
  } catch (error) {
    console.log("Error getting image, error: ", error);
    return response.status(404).send({
      message: error
    }); // success
  }
};

module.exports = { fetchRandomImage };
