const express = require("express"),
  router = express.Router();
const member = require("../models/member_db");

router
  .route("/")
  .get(member.getAllMembers)
  .post(member.createMember);

router.route("/city").get(member.getCityList);

router
  .route("/:id")
  .get(member.getMemberById)
  .put(member.updateMember)
  .delete(member.deleteMember);

router.route("/name/:name").get(member.getMemberByName);

module.exports = router;
