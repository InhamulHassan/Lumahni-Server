const { db } = require("../helpers/db"); // get the Database Connection object

const getAllUsers = async (request, response) => {
  try {
    const query = await db.any("SELECT * FROM userlogin");
    if (Object.keys(query).length) {
      return response.status(200).send({
        users: query
      }); // success
    } else {
      return response.status(404).send({
        message: "Users not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getUserByAttribute = async (attr, data, request, response) => {
  try {
    const query = await db.any(`SELECT * FROM userlogin WHERE ${attr} = $1`, [
      data
    ]);
    if (Object.keys(query).length) {
      return response.status(200).send({
        user: query[0]
      }); // success
    } else {
      return response.status(404).send({
        message: "User not found"
      }); // success
    }
  } catch (err) {
    throw err; // error
  }
};

const getUserById = (request, response) => {
  if ((id = parseInt(request.params.id))) {
    return getUserByAttribute("id", id, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected User ID"
    }); // success
  }
};

const getUserByUsername = (request, response) => {
  if ((username = request.params.username)) {
    return getUserByAttribute("username", username, request, response);
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected Username"
    }); // success
  }
};

const createUser = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      const result = await db.one(
        "INSERT INTO userlogin(username, password_hash, full_name, user_role) VALUES(${username}, ${password_hash}, ${full_name}, ${user_role}) RETURNING id",
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
      message: "Invalid parameters supplied, expected User Details"
    }); // success
  }
};

const updateUser = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if ((id = parseInt(request.params.id)) || Object.keys(requestBody).length) {
    requestBody.id = id; // linking the id paramater into the JSON object
    try {
      await db.none(
        "UPDATE userlogin SET username = ${username}, password_hash = ${password_hash}, full_name = ${full_name}, user_role = ${user_role} WHERE id = ${id}",
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
      message: "Invalid parameters supplied, expected User ID and Details"
    }); // success
  }
};

const deleteUser = async (request, response) => {
  if ((id = parseInt(request.params.id))) {
    try {
      const res = await db.result("DELETE FROM userlogin WHERE id = $1", [id]);
      return response.status(200).send({
        success: true,
        rowsAffected: res.rowCount
      });
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameter supplied, expected User ID"
    }); // success
  }
};

// Auth Functions
const checkUserExists = async (request, response) => {
  if ((username = request.body.username)) {
    try {
      const query = await db.any(
        `SELECT * FROM userlogin WHERE username = $1`,
        [username]
      );
      if (Object.keys(query).length) {
        return query[0]; // success
      } else {
        return false; // success
      }
    } catch (err) {
      throw err; // error
    }
  } else {
    return false;
  }
};

const updateLogTime = async (request, response, id) => {
  if ((id = parseInt(id))) {
    try {
      await db.none(
        "UPDATE userlogin SET last_logged = CURRENT_TIMESTAMP WHERE id = $1",
        [id]
      );
      return true;
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected User ID"
    }); // success
  }
};

const resetPassword = async (request, response) => {
  const requestBody = request.body; // req.body has structure [{...}] pg-promise needs {...}
  if (Object.keys(requestBody).length) {
    try {
      await db.none(
        "UPDATE userlogin SET password_hash = ${password_hash} WHERE id = ${id}",
        requestBody
      );
      return response.status(200).send({
        success: true
      }); // success
    } catch (err) {
      throw err; //error
    }
  } else {
    return response.status(400).send({
      message: "Invalid parameters supplied, expected User ID and Password"
    }); // success
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  checkUserExists,
  updateLogTime,
  resetPassword
};
