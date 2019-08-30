const express = require("express"),
  router = express.Router();
const user = require("../models/user_db");
const auth = require("../models/auth_db");

router.route("/username/:username").get(user.getUserByUsername);

router
  .route("/auth")
  .get(function(request, response) {
    response.status(200).send({
      message: "User Auth API"
    }); // success
  })
  .post(auth.authorizeUser);

router.route("/details").get(auth.fetchAuthUser);

router
  .route("/register")
  .get(function(request, response) {
    response.status(200).send({
      message: "User Register API"
    }); // success
  })
  .post(auth.registerUser);

router
  .route("/reset")
  .get(function(request, response) {
    response.status(200).send({
      message: "Reset Password API"
    }); // success
  })
  .post(auth.resetPassword);

router
  .route("/")
  .get(user.getAllUsers)
  .post(user.createUser);

router
  .route("/:id")
  .get(user.getUserById)
  .put(user.updateUser)
  .delete(user.deleteUser);

module.exports = router;
