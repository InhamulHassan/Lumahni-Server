const { db, pgp } = require("../helpers/db"); // get the Database Connection object

const getBooks = async (request, response, limitQuery = false, page = 1) => {
  let query = `SELECT b.id, b.grid, b.title, b.isbn, b.isbn13, b.descr, b.img, b.img_thumbnail, bba.authors, bbg.genres 
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
	) bbg USING(id) ORDER BY id ASC`;
  const limit = 20;
  const offset = limit * (page - 1);
  query += !!page & limitQuery ? ` LIMIT ${limit} OFFSET ${offset}` : "";

  try {
    const books = await db.any(query);
    return response.status(200).json(books); // success
  } catch (err) {
    throw err; // error
  }
};

const getAllBooks = (request, response) => {
  return getBooks(request, response, false);
};

const getAllBooksByPage = (request, response) => {
  const page = parseInt(request.params.page) || 1;
  return getBooks(request, response, true, page);
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
	) bbg USING(id) WHERE ${attr} = $1`,
      [data]
    );
    return response.status(200).json(query[0]); // success
  } catch (err) {
    throw err; // error
  }
};

const getBookById = (request, response) => {
  const id = parseInt(request.params.id);
  return getBookByAttribute("id", id, request, response);
};

const getBookByGRId = (request, response) => {
  const grid = request.params.grid;
  return getBookByAttribute("grid", grid, request, response);
};

const getBookByISBN = (request, response) => {
  const isbn = request.params.isbn;
  return getBookByAttribute("isbn", isbn, request, response);
};

const getBookByISBN13 = (request, response) => {
  const isbn13 = request.params.isbn13;
  return getBookByAttribute("isbn13", isbn13, request, response);
};

const getBookByTitle = (request, response) => {
  const title = request.params.title;
  return getBookByAttribute("title", title, request, response);
};

const createBook = async (request, response) => {
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  //  console.log("create book + obj: " + JSON.stringify(obj));
  try {
    const result = await db
      .one(
        "INSERT INTO book(grid, title, isbn, isbn13, descr, img, img_thumbnail) VALUES(${grid}, ${title}, ${isbn}, ${isbn13}, ${descr}, ${img}, ${img_thumbnail}) RETURNING id",
        obj
      )
      .then(res => {
        return db
          .tx(t => {
            const genreArray = obj.genres || [];
            const authorArray = obj.authors || [];
            // using pg-promise helper methods to define the columnset (a table schema)
            const bookByGenre = pgp.helpers.ColumnSet(["book_id", "genre_id"], {
              table: "bookbygenre"
            });
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
};

const updateBook = async (request, response) => {
  const id = parseInt(request.params.id);
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  obj.id = id; // linking the id paramater into the JSON object
  try {
    await db
      .none(
        "UPDATE book SET grid = ${grid}, title = ${title}, isbn = ${isbn}, isbn13 = ${isbn13}, descr = ${descr}, img = ${img}, img_thumbnail = ${img_thumbnail} WHERE id = ${id}",
        obj
      )
      .then(() => {
        return db
          .tx(t => {
            return t.batch([
              t.none("DELETE FROM bookByGenre WHERE book_id = $1", [obj.id]),
              t.none("DELETE FROM bookByAuthor WHERE book_id = $1", [obj.id])
            ]);
          })
          .catch(error => {
            console.log("ERROR:", error);
          });
      })
      .then(() => {
        return db
          .tx(t1 => {
            const genreArray = obj.genres || [];
            const authorArray = obj.authors || [];
            // using pg-promise helper methods to define the columnset (a table schema)
            const bookByGenre = pgp.helpers.ColumnSet(["book_id", "genre_id"], {
              table: "bookbygenre"
            });
            const bookByAuthor = pgp.helpers.ColumnSet(
              ["book_id", "author_id"],
              { table: "bookbyauthor" }
            );
            // using object map method to create an array with book_id (same) and genre_id/author_id (changing)
            const genreValues = genreArray.map(genre => {
              return { book_id: obj.id, genre_id: genre.id };
            });
            const authorValues = authorArray.map(author => {
              return { book_id: obj.id, author_id: author.id };
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

    return response.status(201).send({
      success: true,
      changesMade: obj
    }); // success
  } catch (err) {
    throw err; //error
  }
};

const deleteBook = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const res = await db.result("DELETE FROM book WHERE id = $1", [id]);
    return response.status(200).send({
      success: true,
      rowsAffected: res.rowCount
    });
  } catch (err) {
    throw err; //error
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
