const { db } = require("../helpers/db"); // search the Database Connection object

const searchBooksByAttribute = async (attr, data, request, response) => {
  try {
    // The ILIKE is to make the pattern-matching case-insensitive
    const query = await db.any(
      `SELECT id, grid, title, isbn, isbn13, descr, img, img_thumbnail, authors, genres
	FROM book b
	LEFT JOIN(
		SELECT bba.book_id AS id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba USING(id) 
	LEFT JOIN(
		SELECT bbg.book_id AS id, json_agg(json_build_object('id', g.id, 'name', g.name)) AS genres
		FROM bookbygenre bbg
		JOIN genre g ON g.id = bbg.genre_id
		GROUP BY bbg.book_id
	) bbg USING(id) WHERE ${attr} ILIKE '%$1#%'`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        results: query
      }); // success
    } else {
      return response.status(404).send({
        message: "No results found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const searchBooksByTitle = (request, response) => {
  if ((titleQuery = request.params.titleQuery)) {
    return searchBooksByAttribute("title", titleQuery, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Title"
    }); // success
  }
};

const searchBooksByISBN = (request, response) => {
  if ((isbnQuery = request.params.isbnQuery)) {
    return searchBooksByAttribute("isbn", isbnQuery, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ISBN"
    }); // success
  }
};

const searchBooksByISBN13 = (request, response) => {
  if ((isbn13Query = request.params.isbn13Query)) {
    return searchBooksByAttribute("isbn13", isbn13Query, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ISBN13"
    }); // success
  }
};

const searchAuthorsByName = async (request, response) => {
  if ((authorNameQuery = request.params.authorNameQuery)) {
    try {
      const query = await db.any(
        `SELECT id, grid, name, bio, img_l, img_m, img_s FROM author WHERE name ILIKE '%$1#%'`,
        [authorNameQuery]
      );
      if (Object.keys(query).length) {
        return response.status(200).send({
          results: query
        }); // success
      } else {
        return response.status(404).send({
          message: "No results found"
        }); // success
      }
    } catch (err) {
      throw err; // error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Author Name"
    }); // success
  }
};

const searchGenresByName = async (request, response) => {
  if ((genreNameQuery = request.params.genreNameQuery)) {
    try {
      const query = await db.any(
        `SELECT id, name, descr, img_l, img_m, img_s FROM genre WHERE name ILIKE '$1#%'`,
        [genreNameQuery]
      );
      if (Object.keys(query).length) {
        return response.status(200).send({
          results: query
        }); // success
      } else {
        return response.status(404).send({
          message: "No results found"
        }); // success
      }
    } catch (err) {
      throw err; // error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Genre Name"
    }); // success
  }
};

module.exports = {
  searchBooksByISBN,
  searchBooksByTitle,
  searchBooksByISBN13,
  searchAuthorsByName,
  searchGenresByName
};
