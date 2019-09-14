const { db, pgp } = require("../helpers/db"); // get the Database Connection object

// Function for fetching book copy data
const getAllBookCopies = async (request, response) => {
  let sqlQuery = `SELECT bc.id, bc.book_id, b.title, b.img, b.isbn, b.isbn13, bba.authors, bc.availability, bc.format, bc.call_number, bs.floor, bs.section, bs.shelf_code
    FROM bookcopy bc
	LEFT JOIN book b ON b.id = bc.book_id 
	LEFT JOIN(
		SELECT bba.book_id AS id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.id = b.id 
	LEFT JOIN bookshelf bs ON bs.call_number = bc.call_number
	ORDER BY bc.book_id, bc.id ASC`;
  try {
    const query = await db.any(sqlQuery);
    if (Object.keys(query).length) {
      return response.status(200).send({
        copies: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Book Copies not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookCopyByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT bc.id AS copy_id, b.id, b.title, b.img, b.isbn, b.isbn13, bba.authors, bc.availability, bc.format, bc.call_number, bs.floor, bs.section, bs.shelf_code
    FROM bookcopy bc
	LEFT JOIN book b ON b.id = bc.book_id 
	LEFT JOIN(
		SELECT bba.book_id AS id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.id = b.id 
	LEFT JOIN bookshelf bs ON bs.call_number = bc.call_number
	WHERE ${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        copy: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the book copy"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookCopyById = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getBookCopyByAttribute("bc.id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Copy ID"
    }); // success
  }
};

const getBookCopyByCallNumber = (request, response) => {
  if ((callNumber = parseInt(request.params.call_number))) {
    // parsing the numbers from the paramater and casting it as a string before sending to query (since the data type of query is character varying)
    return getBookCopyByAttribute(
      "bc.call_number",
      `${callNumber}`,
      request,
      response
    );
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Call Number"
    }); // success
  }
};

const getBookCopiesByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT bc.id AS copy_id, b.id, b.title, b.img, b.isbn, b.isbn13, bba.authors, bc.availability, bc.format, bc.call_number, bs.floor, bs.section, bs.shelf_code
    FROM bookcopy bc
	LEFT JOIN book b ON b.id = bc.book_id 
	LEFT JOIN(
		SELECT bba.book_id AS id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.id = b.id 
	LEFT JOIN bookshelf bs ON bs.call_number = bc.call_number
	WHERE ${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        copies: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the book copies"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookCopiesByBookId = (request, response) => {
  if ((bookId = parseInt(request.params.book_id))) {
    return getBookCopiesByAttribute("bc.book_id", bookId, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ID"
    }); // success
  }
};

const getBookCopiesByAvailability = (request, response) => {
  if ((availability = request.params.availability)) {
    if (availability === "true" || availability === "false") {
      return getBookCopiesByAttribute(
        "bc.availability",
        availability,
        request,
        response
      );
    } else {
      return response.status(400).send({
        message: "Invalid parameter supplied, expected either true or false"
      }); // success
    }
  } else {
    return response.status(400).send({
      message:
        "Invalid parameter supplied, expected Book Copy Availability Boolean"
    }); // success
  }
};

const getBookCopiesByShelfCode = (request, response) => {
  if ((shelfCode = request.params.shelf_code)) {
    return getBookCopiesByAttribute(
      "bs.shelf_code",
      shelfCode,
      request,
      response
    );
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Shelf Code"
    }); // success
  }
};

const createBookCopy = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO bookcopy(book_id, call_number, availability, format) VALUES(${book_id}, ${call_number}, ${availability}, ${format}) RETURNING id",
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
      message: "Invalid parameters supplied, expected Book Copy Details"
    }); // success
  }
};

const createBookShelf = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO bookshelf(call_number, floor, section, shelf_code) VALUES(${call_number}, ${floor}, ${section}, ${shelf_code}) RETURNING id",
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
      message: "Invalid parameters supplied, expected Book Shelf Details"
    }); // success
  }
};

const updateBookCopy = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db.none(
        "UPDATE bookcopy SET book_id = ${book_id}, call_number = ${call_number}, availability = ${availability}, format = ${format} WHERE id = ${id}",
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
      message: "Invalid parameters supplied, expected Book Copy ID and Details"
    }); // success
  }
};

// toggles the book availability based on the previous value
const toggleBookCopyAvailability = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const query = await db.one(
        "UPDATE bookcopy SET availability = NOT availability WHERE id = $1 RETURNING *",
        [id]
      );
      return response.status(200).send({
        success: true,
        changesMade: query
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Book Copy ID"
    }); // success
  }
};

const deleteBookCopy = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM bookcopy WHERE id = $1", [id]);
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Copy ID"
    }); // success
  }
};

const deleteBookCopyByBookId = async (request, response) => {
  if ((bookId = parseInt(request.params.book_id))) {
    try {
      const res = await db.result("DELETE FROM bookcopy WHERE book_id = $1", [
        bookId
      ]);
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
  getAllBookCopies,
  getBookCopyById,
  getBookCopyByCallNumber,
  getBookCopiesByBookId,
  getBookCopiesByAvailability,
  getBookCopiesByShelfCode,
  createBookCopy,
  updateBookCopy,
  toggleBookCopyAvailability,
  deleteBookCopy,
  deleteBookCopyByBookId
};
