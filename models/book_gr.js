const { fetchGR } = require("../helpers/fetch_goodreads");

// Get a single book entity from the results
// Gets a book when given a query
const getBook = (endpoint, query = "") => {
    console.log(endpoint + ':- get book by GR - ' + query );
  return fetchGR(`book/${endpoint}`, query).then(res => res.book[0]);
};

// Gets a book when given a GoodReads id
const getBookByGRId = grId => {
  return getBook(`show/${grId}.xml`);
};

// Gets a book when given a ISBN
const getBookByISBN = isbn => {
  const bookISBN = encodeURIComponent(isbn);
  return getBook(`isbn/${isbn}`);
};

// Gets a book when given a title and/or author
const getBookByTitle = data => {
  const bookTitle = encodeURIComponent(data.title);
  let bookAuthor = data.author_name;
  bookAuthor = bookAuthor.length
    ? `author=${encodeURIComponent(bookAuthor)}&`
    : "";
  return getBook("title.xml", `${bookAuthor}title=${bookTitle}`);
};

module.exports = {
  getBookByGRId,
  getBookByISBN,
  getBookByTitle
};
