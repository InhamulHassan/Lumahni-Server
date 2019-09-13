const { db, pgp } = require("../helpers/db"); // get the Database Connection object

const getBooks = async (
  request,
  response,
  limitQuery = false,
  page = 1,
  limit = 10
) => {
  let sqlQuery = `SELECT b.id, b.grid, b.title, b.isbn, b.isbn13, b.descr, b.img, b.img_thumbnail, bba.authors, bbg.genres
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
	) bbg USING(id) ORDER BY id DESC`;
  const offset = limit * page;
  sqlQuery += limitQuery ? ` LIMIT ${limit} OFFSET ${offset}` : "";

  sqlCount = `SELECT count(*) AS total FROM book b`;

  try {
    const query = await db.any(sqlQuery);
    const count = await db.any(sqlCount);
    if (Object.keys(query).length) {
      return response.status(200).send({
        books: query,
        total: parseInt(count[0]["total"])
      }); // success
    } else {
      return response.status(404).send({
        message: "Books not found or end of page limit reached"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getAllBooks = (request, response) => {
  return getBooks(request, response, false);
};

const getAllBooksByPage = (request, response) => {
  const page = parseInt(request.params.page) || 0;
  const limit = parseInt(request.query.limit) || 10;
  return getBooks(request, response, true, page, limit);
};

const getBookByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT b.id, b.grid, b.title, b.isbn, b.isbn13, b.descr, b.img, b.img_thumbnail, bba.authors, bbg.genres 
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
	) bbg USING(id) WHERE b.${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        book: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the book"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookById = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getBookByAttribute("id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ID"
    }); // success
  }
};

const getBookByGRId = (request, response) => {
  if ((grid = request.params.grid)) {
    return getBookByAttribute("grid", grid, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Goodreads ID"
    }); // success
  }
};

const getBookByISBN = (request, response) => {
  if ((isbn = request.params.isbn)) {
    return getBookByAttribute("isbn", isbn, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ISBN"
    }); // success
  }
};

const getBookByISBN13 = (request, response) => {
  if ((isbn13 = request.params.isbn13)) {
    return getBookByAttribute("isbn13", isbn13, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ISBN13"
    }); // success
  }
};

const getBookByTitle = (request, response) => {
  if ((title = request.params.title)) {
    return getBookByAttribute("title", title, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Title"
    }); // success
  }
};

const createBook = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db
        .one(
          "INSERT INTO book(grid, title, isbn, isbn13, descr, img, img_thumbnail) VALUES(${grid}, ${title}, ${isbn}, ${isbn13}, ${descr}, ${img}, ${img_thumbnail}) RETURNING id",
          requestBody
        )
        .then(res => {
          return db
            .tx(t => {
              const genreArray = requestBody.genres || [];
              const authorArray = requestBody.authors || [];
              // using pg-promise helper methods to define the columnset (a table schema)
              const bookByGenre = pgp.helpers.ColumnSet(
                ["book_id", "genre_id"],
                {
                  table: "bookbygenre"
                }
              );
              const bookByAuthor = pgp.helpers.ColumnSet(
                ["book_id", "author_id"],
                { table: "bookbyauthor" }
              );
              // using object map method to create an array with book_id (same) and genre_id (changing)
              const genreValues = genreArray.map(genre => {
                return { book_id: res.id, genre_id: genre.id };
              });
              // using object map method to create an array with book_id (same) and author_id (changing)
              const authorValues = authorArray.map(author => {
                return { book_id: res.id, author_id: author.id };
              });
              if (genreValues.length && authorValues.length) {
                // using pg-promise batch method to do a batch transaction (rollsback on failure)
                // uses pg-promise insert helper method to insert the value array into the predefined table ColumnSet
                return t.batch([
                  t.none(pgp.helpers.insert(genreValues, bookByGenre)),
                  t.none(pgp.helpers.insert(authorValues, bookByAuthor))
                ]);
              } else if (genreValues.length) {
                return t.batch([
                  t.none(pgp.helpers.insert(genreValues, bookByGenre))
                ]);
              } else if (authorValues.length) {
                return t.batch([
                  t.none(pgp.helpers.insert(authorValues, bookByAuthor))
                ]);
              }
            })
            .then(data => {
              return { id: res.id, data: data };
            })
            .catch(error => {
              console.log("ERROR:", error);
            });
        });
      return response.status(201).send({
        success: true,
        id: result.id,
        data: result.data
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Book Details"
    }); // success
  }
};

const updateBook = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db
        .none(
          "UPDATE book SET grid = ${grid}, title = ${title}, isbn = ${isbn}, isbn13 = ${isbn13}, descr = ${descr}, img = ${img}, img_thumbnail = ${img_thumbnail} WHERE id = ${id}",
          requestBody
        )
        .then(() => {
          return db
            .tx(t => {
              return t.batch([
                t.none("DELETE FROM bookByGenre WHERE book_id = $1", [
                  requestBody.id
                ]),
                t.none("DELETE FROM bookByAuthor WHERE book_id = $1", [
                  requestBody.id
                ])
              ]);
            })
            .catch(error => {
              console.log("ERROR:", error);
            });
        })
        .then(() => {
          return db
            .tx(t1 => {
              const genreArray = requestBody.genres || [];
              const authorArray = requestBody.authors || [];
              // using pg-promise helper methods to define the columnset (a table schema)
              const bookByGenre = pgp.helpers.ColumnSet(
                ["book_id", "genre_id"],
                {
                  table: "bookbygenre"
                }
              );
              const bookByAuthor = pgp.helpers.ColumnSet(
                ["book_id", "author_id"],
                { table: "bookbyauthor" }
              );
              // using object map method to create an array with book_id (same) and genre_id/author_id (changing)
              const genreValues = genreArray.map(genre => {
                return { book_id: requestBody.id, genre_id: genre.id };
              });
              const authorValues = authorArray.map(author => {
                return { book_id: requestBody.id, author_id: author.id };
              });
              // using pg-promise batch method to do a batch transaction (rollsback on failure)
              // uses pg-promise insert helper method to insert the value array into the predefined table ColumnSet
              if (genreValues.length && authorValues.length) {
                // using pg-promise batch method to do a batch transaction (rollsback on failure)
                // uses pg-promise insert helper method to insert the value array into the predefined table ColumnSet
                return t1.batch([
                  t1.none(pgp.helpers.insert(genreValues, bookByGenre)),
                  t1.none(pgp.helpers.insert(authorValues, bookByAuthor))
                ]);
              } else if (genreValues.length) {
                return t1.batch([
                  t1.none(pgp.helpers.insert(genreValues, bookByGenre))
                ]);
              } else if (authorValues.length) {
                return t1.batch([
                  t1.none(pgp.helpers.insert(authorValues, bookByAuthor))
                ]);
              }
            })
            .catch(error => {
              console.log("ERROR:", error);
            });
        });

      return response.status(200).send({
        success: true,
        changesMade: requestBody
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Book ID and Details"
    }); // success
  }
};

const deleteBook = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM book WHERE id = $1", [id]);
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ID"
    }); // success
  }
};

module.exports = {
  getAllBooks,
  getAllBooksByPage,
  getBookById,
  getBookByGRId,
  getBookByISBN,
  getBookByISBN13,
  getBookByTitle,
  createBook,
  updateBook,
  deleteBook
};
