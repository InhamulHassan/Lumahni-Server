const { db, pgp } = require("../helpers/db"); // get the Database Connection object

const getAllGenres = async (request, response) => {
  try {
    const genres = await db.any("SELECT * FROM genre");
    return response.status(200).json(genres); // success
  } catch (err) {
    throw err; // error
  }
};

const getGenreById = async (request, response) => {
  const id = parseInt(request.params.id);
  try {
    const query = await db.any("SELECT * FROM genre WHERE id = $1", [id]);
    return response.status(200).json(query[0]); // success
  } catch (err) {
    throw err; // error
  }
};

const createGenre = async (request, response) => {
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  try {
    const id = await db.one(
      "INSERT INTO genre(name, abbv, descr, img_l, img_m, img_s) VALUES(${name}, ${abbv}, ${descr}, ${img_l}, ${img_m}, ${img_s}) RETURNING id",
      obj
    );
    return response.status(201).json(id); // success
  } catch (err) {
    throw err; //error
  }
};

const updateGenre = async (request, response) => {
  const id = parseInt(request.params.id);
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  obj.id = id; // linking the id paramater into the JSON object

  try {
    const result = await db.none(
      "UPDATE genre SET name = ${name}, abbv = ${abbv}, descr = ${descr}, img_l = ${img_l}, img_m = ${img_m}, img_s = ${img_s} WHERE id = ${id}",
      obj
    );
    return response.status(201).send({
      success: true,
      id: result.id
    }); // success
  } catch (err) {
    throw err; //error
  }
};

const deleteGenre = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const res = await db.result("DELETE FROM genre WHERE id = $1", [id]);
    return response.status(200).send({
      success: true,
      rowsAffected: res.rowCount
    });
  } catch (err) {
    throw err; //error
  }
};

const getBooksByGenre = async (request, response) => {
  const id = parseInt(request.params.id);
  try {
    const query = await db.any(
      `SELECT g.id, g.name, g.abbv, g.descr, g.img_l, g.img_m, g.img_s, bbg.books
    FROM genre g
	LEFT JOIN(
		SELECT bbg.genre_id, json_agg(json_build_object('id', b.id, 'title', b.title, 'grid', b.grid, 'ísbn', b.isbn, 'isbn13', b.isbn13, 'descr', b.descr, 'img', b.img, 'img_thumbnail', b.img_thumbnail, 'authors', bba.authors)) AS books
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
    return response.status(200).json(query[0]); // success
  } catch (err) {
    throw err; // error
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
