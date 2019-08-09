const { fetchGR } = require("../helpers/fetch_goodreads");

const getAuthorById = id => {
  const authorId = encodeURIComponent(id);
  return fetchGR("author/show.xml", `id=${authorId}`).then(
    res => res.author[0]
  );
};

const getAuthorByName = name => {
  const authorName = encodeURIComponent(name);
  return fetchGR(`api/author_url/${authorName}`)
    .then(res => {
      try {
        // the ['$'].id gets the data attribute of the XML tag
        // (i.e: <author id="589"> ===> author[0]['$'].id)
        return res.author[0]["$"].id;
      } catch (error) {
        return Promise.reject(new Error("Author not found"));
      }
    })
    .then(getAuthorById);
};

const getAllBooksByAuthorId = data => {
  const authorId = encodeURIComponent(data.id);
  const pageNumber = data.page || 1;
  return fetchGR("author/list.xml", `id=${authorId}&page=${pageNumber}`).then(
    res => res.author[0]
  );
};

module.exports = {
  getAuthorById,
  getAuthorByName,
  getAllBooksByAuthorId
};
