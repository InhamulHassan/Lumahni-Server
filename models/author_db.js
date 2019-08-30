const { db, pgp } = require("../helpers/db"); // get the Database Connection object

const getAllAuthors = async (request, response) => {
  try {
    const query = await db.any("SELECT * FROM author");
    if (Object.keys(query).length) {
      return response.status(200).send({
        authors: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Authors not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getAuthorByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT a.id, a.grid, a.name, a.bio, a.img_l, a.img_m, a.img_s, abg.genres
	FROM author a
	LEFT JOIN(
		SELECT abg.author_id, json_agg(json_build_object('id', g.id, 'name', g.name)) AS genres
		FROM authorbygenre abg
		LEFT JOIN genre g ON g.id = abg.genre_id
		GROUP BY abg.author_id
	) abg ON abg.author_id = a.id WHERE ${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        author: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Author not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getAuthorById = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getAuthorByAttribute("id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Author ID"
    }); // success
  }
};

const getAuthorByGRId = async (request, response) => {
  if ((grid = request.params.grid)) {
    return getAuthorByAttribute("grid", grid, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Author Goodreads ID"
    }); // success
  }
};

const getAuthorByName = async (request, response) => {
  if ((name = request.params.name)) {
    return getAuthorByAttribute("name", name, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Author Name"
    }); // success
  }
};

const createAuthor = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db
        .one(
          "INSERT INTO author(grid, name, bio, img_l, img_m, img_s) VALUES(${grid}, ${name}, ${bio}, ${img_l}, ${img_m}, ${img_s}) RETURNING id",
          requestBody
        )
        .then(res => {
          return db
            .tx(t => {
              const genreArray = requestBody.genres || [];
              // using pg-promise helper methods to define the columnset (a table schema)
              const authorByGenre = pgp.helpers.ColumnSet(
                ["author_id", "genre_id"],
                {
                  table: "authorbygenre"
                }
              );
              // using object map method to create an array with author_id (same) and genre_id (changing)
              const genreValues = genreArray.map(genre => {
                return {
                  author_id: res.id,
                  genre_id: genre.id
                };
              });
              if (genreValues.length) {
                return t.batch([
                  t.none(pgp.helpers.insert(genreValues, authorByGenre))
                ]);
              }
            })
            .then(data => {
              return {
                id: res.id,
                data: data
              };
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
      message: "Invalid parameters supplied, expected Author Details"
    }); // success
  }
};

const updateAuthor = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db
        .none(
          "UPDATE author SET grid = ${grid}, name = ${name}, bio = ${bio}, img_l = ${img_l}, img_m = ${img_m}, img_s = ${img_s} WHERE id = ${id}",
          requestBody
        )
        .then(() => {
          return db.none("DELETE FROM authorByGenre WHERE author_id = $1", [
            requestBody.id
          ]);
        })
        .then(() => {
          return db
            .tx(t => {
              const genreArray = requestBody.genres || [];
              // using pg-promise helper methods to define the columnset (a table schema)
              const authorByGenre = pgp.helpers.ColumnSet(
                ["author_id", "genre_id"],
                {
                  table: "authorbygenre"
                }
              );
              // using object map method to create an array with author_id (same) and genre_id (changing)
              const genreValues = genreArray.map(genre => {
                return {
                  author_id: requestBody.id,
                  genre_id: genre.id
                };
              });
              if (genreValues.length) {
                return t.batch([
                  t.none(pgp.helpers.insert(genreValues, authorByGenre))
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
      }); // success returns the updated entry as JSON
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Author ID and Details"
    }); // success
  }
};

const deleteAuthor = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM author WHERE id = $1", [id]);
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Author ID"
    }); // success
  }
};

const getBooksByAuthor = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const query = await db.any(
        `SELECT a.id, a.grid, a.name, a.bio, a.img_l, a.img_m, a.img_s, bba.books
	FROM author a
	LEFT JOIN(
		SELECT bba.author_id, json_agg(json_build_object('id', b.id, 'title', b.title, 'grid', b.grid, 'ísbn', b.isbn, 'isbn13', b.isbn13, 'descr', b.descr, 'img', b.img, 'img_thumbnail', b.img_thumbnail, 'genres', bbg.genres)) AS books
		FROM bookbyauthor bba
		LEFT JOIN book b ON b.id = bba.book_id
		LEFT JOIN(
			SELECT bbg.book_id, json_agg(json_build_object('id', g.id, 'name', g.name)) AS genres
			FROM bookbygenre bbg
			LEFT JOIN genre g ON g.id = bbg.genre_id
			GROUP BY bbg.book_id
		) bbg ON bbg.book_id = b.id
		GROUP BY bba.author_id
	) bba ON bba.author_id = a.id WHERE id = $1`,
        [id]
      );
      if (Object.keys(query).length) {
        return response.status(200).send({
          books: query
        }); // success
      } else {
        return response.status(404).send({
          message: "Books not found"
        }); // success
      }
    } catch (err) {
      throw err; // error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Author ID"
    }); // success
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  getAuthorByGRId,
  getAuthorByName,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getBooksByAuthor
};
