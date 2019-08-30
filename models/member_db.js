const { db } = require("../helpers/db"); // get the Database Connection object

const getAllMembers = async (request, response) => {
  try {
    const query = await db.any("SELECT * FROM member");
    if (Object.keys(query).length) {
      return response.status(200).send({
        members: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Members not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getMemberByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(`SELECT * FROM member WHERE ${attr} = $1`, [
      data
    ]);
    if (Object.keys(query).length) {
      return response.status(200).send({
        member: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "Member not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getMemberById = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getMemberByAttribute("id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Member ID"
    }); // success
  }
};

const getMemberByName = (request, response) => {
  if ((name = parseInt(request.params.name))) {
    return getMemberByAttribute("name", name, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Member Name"
    }); // success
  }
};

const createMember = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO member(first_name, last_name, join_date, expiration_date, email_address, mobile_number, city_id) VALUES(${first_name}, ${last_name}, ${join_date}, ${expiration_date}, ${email_address}, ${mobile_number}, ${city_id}) RETURNING id",
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
      message: "Invalid parameters supplied, expected Member Details"
    }); // success
  }
};

const updateMember = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db.none(
        "UPDATE member SET first_name = ${first_name}, last_name = ${last_name}, expiration_date = ${expiration_date}, email_address = ${email_address}, mobile_number = ${mobile_number}, city_id = ${city_id} WHERE id = ${id}",
        requestBody
      );
      return response.status(201).send({
        success: true,
        changesMade: requestBody
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected Member ID and Details"
    }); // success
  }
};

const deleteMember = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM member WHERE id = $1", [id]);
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

module.exports = {
  getAllMembers,
  getMemberById,
  getMemberByName,
  createMember,
  updateMember,
  deleteMember
};
