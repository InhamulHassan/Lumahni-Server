const { db, pgp } = require("../helpers/db"); // get the Database Connection object

const getAllGenres = async (request, response) => {
  try {
    const query = await db.any("SELECT * FROM genre ORDER BY name ASC");
    if (Object.keys(query).length) {
      return response.status(200).send({
        genres: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Genres not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getGenreById = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const query = await db.any("SELECT * FROM genre WHERE id = $1", [id]);
      if (Object.keys(query).length) {
        return response.status(200).send({
          genre: query[0]
        }); // success
      } else {
        return response.status(404).send({
          message: "Genre not found"
        }); // success
      }
    } catch (err) {
      throw err; // error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter"
    }); // success
  }
};

const createGenre = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO genre(name, descr, img_l, img_m, img_s) VALUES(${name}, ${descr}, ${img_l}, ${img_m}, ${img_s}) RETURNING id",
        requestBody
      );
      return response.status(201).send({
        success: true,
        id: result.id
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Genre Details"
    }); // success
  }
};

const updateGenre = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      const result = await db.none(
        "UPDATE genre SET name = ${name}, descr = ${descr}, img_l = ${img_l}, img_m = ${img_m}, img_s = ${img_s} WHERE id = ${id}",
        requestBody
      );
      return response.status(200).send({
        success: true,
        changesMade: requestBody
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Genre ID and Details"
    }); // success
  }
};

const deleteGenre = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM genre WHERE id = $1", [id]);
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Genre ID"
    }); // success
  }
};

const getBooksByGenre = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const query = await db.any(
        `SELECT g.id, g.name, g.descr, g.img_l, g.img_m, g.img_s, bbg.books
    FROM genre g
	LEFT JOIN(
		SELECT bbg.genre_id, json_agg(json_build_object('id', b.id, 'title', b.title, 'grid', b.grid, 'isbn', b.isbn, 'isbn13', b.isbn13, 'descr', b.descr, 'img', b.img, 'img_thumbnail', b.img_thumbnail, 'authors', bba.authors)) AS books
		FROM bookbygenre bbg
		LEFT JOIN book b ON b.id = bbg.book_id
		LEFT JOIN(
			SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
			FROM bookbyauthor bba
			LEFT JOIN author a ON a.id = bba.author_id
			GROUP BY bba.book_id
		) bba ON bba.book_id = b.id 
		GROUP BY bbg.genre_id
	) bbg ON bbg.genre_id = g.id 
	WHERE g.id = $1`,
        [id]
      );
      if (Object.keys(query).length) {
        return response.status(200).send({
          books: query[0]
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
      message: "Invalid parameter supplied, expected Genre ID"
    }); // success
  }
};

module.exports = {
  getAllGenres,
  getGenreById,
  createGenre,
  updateGenre,
  deleteGenre,
  getBooksByGenre
};
