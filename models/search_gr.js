const fetchGR = require("../helpers/fetch_goodreads");

// Get multiple book entities from the results
//const searchBooks = query => {
//    return fetchGR('search/index.xml', query)
//        .then(res => res.search[0]);
//};

//const searchBooks = query => {
//  return fetchGR("search/index.xml", query).then(res => {
//    const search = res.search[0];
//    try {
//      if (search.total_results[0] > 0) {
//        return {
//          start: search.results_starts[0],
//          end: search.results_end[0],
//          total: search.total_results[0],
//          results: search.results[0]
//        };
//      } else {
//        return {
//          start: 0,
//          end: 0,
//          total: 0,
//          results: "No results were found"
//        };
//      }
//    } catch (error) {
//      return Promise.reject(new Error("An error was found"));
//    }
//  });
//};

const searchBooks = query => {
  return fetchGR("search/index.xml", query).then(res => {
    //      console.log('data' + JSON.stringify(res.search[0]) + ':/end')
    return res.search[0];
  });
};

// get lists of book when given a title query
const searchBooksByTitle = data => {
  const bookName = encodeURIComponent(data.title);
  const pageNumber = data.page || 1;
  return searchBooks(
    `q=${bookName}&search[field]=title&page=${pageNumber}&format=xml`
  );
};

// get lists of book when given a author query
const searchBooksByAuthorName = data => {
  const authorName = encodeURIComponent(data.author_name);
  const pageNumber = data.page || 1;
  return searchBooks(
    `q=${authorName}&search[field]=author&page=${pageNumber}&format=xml`
  );
};

// get lists of book when given a title query
const searchBooksByISBN = data => {
  const bookISBN = encodeURIComponent(data.isbn);
  const pageNumber = data.page || 1;
  return searchBooks(
    `q=${bookISBN}&search[field]=isbn&page=${pageNumber}&format=xml`
  );
};

// get lists of book when given a genre query
const searchBooksByGenre = data => {
  const bookGenre = encodeURIComponent(data.genre);
  const pageNumber = data.page || 1;
  return searchBooks(
    `q=${bookGenre}&search[field]=genre&page=${pageNumber}&format=xml`
  );
};

module.exports = {
  searchBooksByTitle,
  searchBooksByAuthorName,
  searchBooksByISBN,
  searchBooksByGenre
};
