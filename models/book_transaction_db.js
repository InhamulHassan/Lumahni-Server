const { db, pgp } = require("../helpers/db"); // get the Database Connection object

// functions for fetching book issue data
const getAllBookIssues = async (request, response) => {
  let sqlQuery = `SELECT i.id, bc.book_id, i.copy_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, m.id AS member_id, m.first_name, m.last_name,  i.issued_date, i.due_date, CASE WHEN rb.id IS null THEN false ELSE true END AS returned
    FROM issuedbooks i
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = i.copy_id 
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	LEFT JOIN member m ON m.id = i.member_id 
	LEFT JOIN returnbooks rb ON rb.issue_id = i.id
	ORDER BY i.id DESC`;
  try {
    const query = await db.any(sqlQuery);
    if (Object.keys(query).length) {
      return response.status(200).send({
        issues: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Issued Books not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookIssueByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT i.id, bc.book_id, i.copy_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, m.id AS member_id, m.first_name, m.last_name,  i.issued_date, i.due_date, CASE WHEN rb.id IS null THEN false ELSE true END AS returned
    FROM issuedbooks i
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = i.copy_id 
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	LEFT JOIN member m ON m.id = i.member_id 
	LEFT JOIN returnbooks rb ON rb.issue_id = i.id
	WHERE ${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        issue: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the issued book"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookIssueByIssueId = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getBookIssueByAttribute("i.id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Issue ID"
    }); // success
  }
};

const getBookIssueByCallNumber = (request, response) => {
  if ((callNumber = parseInt(request.params.call_number))) {
    // parsing the numbers from the paramater and casting it as a string before sending to query (since the data type of query is character varying)
    return getBookIssueByAttribute(
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

const getBookIssuesByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT i.id, bc.book_id, i.copy_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, m.id AS member_id, m.first_name, m.last_name,  i.issued_date, i.due_date, CASE WHEN rb.id IS null THEN false ELSE true END AS returned
    FROM issuedbooks i
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = i.copy_id 
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	LEFT JOIN member m ON m.id = i.member_id 
	LEFT JOIN returnbooks rb ON rb.issue_id = i.id
	WHERE ${attr} = $1
    ORDER BY i.id DESC`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        issues: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the issued books"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookIssuesByBookId = (request, response) => {
  if ((bookId = parseInt(request.params.book_id))) {
    return getBookIssuesByAttribute("bc.book_id", bookId, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ID"
    }); // success
  }
};

const getBookIssuesByMemberId = (request, response) => {
  if ((memberId = parseInt(request.params.member_id))) {
    return getBookIssuesByAttribute("m.id", memberId, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Member ID"
    }); // success
  }
};

const getBookIssuesByReturned = async (request, response) => {
  if ((returned = request.params.returned)) {
    let query = `SELECT i.id, bc.book_id, i.copy_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, m.id AS member_id, m.first_name, m.last_name,  i.issued_date, i.due_date, CASE WHEN rb.id IS null THEN false ELSE true END AS returned
    FROM issuedbooks i
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = i.copy_id 
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	LEFT JOIN member m ON m.id = i.member_id 
	LEFT JOIN returnbooks rb ON rb.issue_id = i.id`;
    if (returned === "true") {
      query += ` WHERE rb.id IS NOT null`;
    } else if (returned === "false") {
      query += ` WHERE rb.id IS null`;
    } else {
      return response.status(400).send({
        message: "Invalid parameter supplied, expected either true or false"
      }); // success
    }
    query += ` ORDER BY rb.id DESC`;
    const result = await db.any(query);
    if (Object.keys(query).length) {
      return response.status(200).send({
        issues: result
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the issued books"
      }); // success
    }
  } else {
    return response.status(400).send({
      message:
        "Invalid parameter supplied, expected Book Copy Availability Boolean"
    }); // success
  }
};

const createBookIssue = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length > 0) {
    try {
      const result = await db.one(
        "INSERT INTO issuedbooks(copy_id, member_id, issued_date, due_date) VALUES(${copy_id}, ${member_id}, ${issued_date}, ${due_date}) RETURNING id",
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
      message: "Invalid parameters supplied, expected Book Issue Details"
    }); // success
  }
};

const updateBookIssue = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db.none(
        "UPDATE issuedbooks SET copy_id = ${copy_id}, member_id = ${member_id}, issued_date = ${issued_date}, due_date = ${due_date} WHERE id = ${id}",
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
      message: "Invalid parameters supplied, expected Book Issue ID and Details"
    }); // success
  }
};

const deleteBookIssue = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM issuedbooks WHERE id = $1", [
        id
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
      message: "Invalid parameter supplied, expected Book Issue ID"
    }); // success
  }
};

const deleteBookIssueByMemberId = async (request, response) => {
  if ((memberId = parseInt(request.params.member_id))) {
    try {
      const res = await db.result(
        "DELETE FROM issuedbooks WHERE member_id = $1",
        [memberId]
      );
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Member ID"
    }); // success
  }
}; // functions for fetching book return data
const getAllBookReturns = async (request, response) => {
  let sqlQuery = `SELECT r.id, r.issue_id, ib.member_id, m.first_name, m.last_name, bc.id AS copy_id, bc.book_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, ib.issued_date, r.return_date, r.overdue_rate
    FROM returnbooks r
	LEFT JOIN issuedbooks ib ON ib.id = r.issue_id
	LEFT JOIN member m ON m.id = ib.member_id 
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = ib.copy_id
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	ORDER BY r.id DESC`;
  try {
    const query = await db.any(sqlQuery);
    if (Object.keys(query).length) {
      return response.status(200).send({
        returns: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Return Books not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookReturnByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT r.id, r.issue_id, ib.member_id, m.first_name, m.last_name, bc.id AS copy_id, bc.book_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, ib.issued_date, r.return_date, r.overdue_rate
    FROM returnbooks r
	LEFT JOIN issuedbooks ib ON ib.id = r.issue_id
	LEFT JOIN member m ON m.id = ib.member_id 
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = ib.copy_id
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	WHERE ${attr} = $1`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        return: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the returned book"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookReturnByReturnId = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getBookReturnByAttribute("r.id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Return ID"
    }); // success
  }
};

const getBookReturnByCallNumber = (request, response) => {
  if ((callNumber = parseInt(request.params.call_number))) {
    // parsing the numbers from the paramater and casting it as a string before sending to query (since the data type of query is character varying)
    return getBookReturnByAttribute(
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

const getBookReturnsByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(
      `SELECT r.id, r.issue_id, ib.member_id, m.first_name, m.last_name, bc.id AS copy_id, bc.book_id, bc.title, bba.authors, bc.img, bc.img_thumbnail, bc.call_number, ib.issued_date, r.return_date, r.overdue_rate
    FROM returnbooks r
	LEFT JOIN issuedbooks ib ON ib.id = r.issue_id
	LEFT JOIN member m ON m.id = ib.member_id 
	LEFT JOIN(
		SELECT bc.id, bc.book_id, b.title, b.img, b.img_thumbnail, bc.call_number
		FROM bookcopy bc
		JOIN book b ON b.id = bc.book_id
		GROUP BY b.id, bc.id
	) bc ON bc.id = ib.copy_id
	LEFT JOIN(
		SELECT bba.book_id, json_agg(json_build_object('id', a.id, 'name', a.name, 'grid', a.grid)) AS authors
		FROM bookbyauthor bba
		JOIN author a ON a.id = bba.author_id
		GROUP BY bba.book_id
	) bba ON bba.book_id = bc.book_id
	WHERE ${attr} = $1
    ORDER BY r.id DESC`,
      [data]
    );
    if (Object.keys(query).length) {
      return response.status(200).send({
        returns: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Unable to find the returned books"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getBookReturnsByBookId = (request, response) => {
  if ((bookId = parseInt(request.params.book_id))) {
    return getBookReturnsByAttribute("bc.book_id", bookId, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book ID"
    }); // success
  }
};

const getBookReturnsByMemberId = (request, response) => {
  if ((memberId = parseInt(request.params.member_id))) {
    return getBookReturnsByAttribute("m.id", memberId, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Member ID"
    }); // success
  }
};

const createBookReturn = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO returnbooks(issue_id, return_date, overdue_rate) VALUES(${issue_id}, ${return_date}, ${overdue_rate}) RETURNING id",
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
      message: "Invalid parameters supplied, expected Book Return Details"
    }); // success
  }
};

const updateBookReturn = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db.none(
        "UPDATE returnbooks SET issue_id = ${issue_id}, return_date = ${return_date}, overdue_rate = ${overdue_rate} WHERE id = ${id}",
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
      message:
        "Invalid parameters supplied, expected Book Return ID and Details"
    }); // success
  }
};

const deleteBookReturn = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM returnbooks WHERE id = $1", [
        id
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
      message: "Invalid parameter supplied, expected Book Return ID"
    }); // success
  }
};

const deleteBookReturnByIssueId = async (request, response) => {
  if ((issueId = parseInt(request.params.issue_id))) {
    try {
      const res = await db.result(
        "DELETE FROM returnbooks WHERE issue_id = $1",
        [issueId]
      );
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Book Issue ID"
    }); // success
  }
};

module.exports = {
  getAllBookIssues,
  getBookIssueByIssueId,
  getBookIssueByCallNumber,
  getBookIssuesByBookId,
  getBookIssuesByMemberId,
  getBookIssuesByReturned,
  createBookIssue,
  updateBookIssue,
  deleteBookIssue,
  deleteBookIssueByMemberId,
  getAllBookReturns,
  getBookReturnByReturnId,
  getBookReturnByCallNumber,
  getBookReturnsByBookId,
  getBookReturnsByMemberId,
  createBookReturn,
  updateBookReturn,
  deleteBookReturn,
  deleteBookReturnByIssueId
};
