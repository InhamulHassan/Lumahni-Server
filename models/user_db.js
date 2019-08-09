const { db, pgp } = require("../helpers/db"); // get the Database Connection object

//const db = require("../helpers/db"); // get the Database Connection object

const getAllMembers = async (request, response) => {
  try {
    const members = await db.any("SELECT * FROM member");
    return response.status(200).json(members); // success
  } catch (err) {
    throw err; // error
  }
};

const getMemberByAttribute = async (attr, data) => {
  try {
    const query = await db.any(`SELECT * FROM member WHERE ${attr} = $1`, [
      data
    ]);
    return response.status(200).json(query); // success
  } catch (err) {
    throw err; // error
  }
};

const getMemberById = async (request, response) => {
  const id = parseInt(request.params.id);
  return getMemberByAttribute("id", id);
};

const getMemberByName = async (request, response) => {
  const name = request.params.name;
  return getMemberByAttribute("name", name);
};

const createMember = async (request, response) => {
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  try {
    const result = await db.one(
      "INSERT INTO member(name, join_date, expiration_date) VALUES(${name}, ${join_date}, ${expiration_date}) RETURNING id",
      obj
    );

    return response.status(201).json(result); // success
  } catch (err) {
    throw err; //error
  }
};

const updateMember = async (request, response) => {
  const id = parseInt(request.params.id);
  const obj = request.body; // req.body has structure [{...}] pg-promise needs {...}
  obj.id = id; // linking the id paramater into the JSON object

  try {
    await db.none(
      "UPDATE member SET name = ${name}, join_date = ${join_date}, expiration_date = ${expiration_date} WHERE id = ${id}",
      obj
    );
    return response.status(201).send({
      success: true,
      changesMade: obj
    });
  } catch (err) {
    throw err; //error
  }
};

const deleteMember = async (request, response) => {
  const id = parseInt(request.params.id);

  try {
    const res = await db.result("DELETE FROM member WHERE id = $1", [id]);
    return response.status(200).send({
      success: true,
      rowsAffected: res.rowCount
    });
  } catch (err) {
    throw err; //error
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
