const express = require("express"),
  router = express.Router();
const user = require("../models/user_db");

router
  .route("/member")
  .get(user.getAllMembers)
  .post(user.createMember);

router
  .route("/member/:id")
  .get(user.getMemberById)
  .put(user.updateMember)
  .delete(user.deleteMember);

router.route("/name/:name").get(user.getMemberByName);

module.exports = router;
