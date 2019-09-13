const user = require("./user_db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const registerUser = async (request, response) => {
  const userExists = await user.checkUserExists(request, response);
  if (userExists == false) {
    await bcrypt.genSalt(10, function(err, salt) {
      if (!err) {
        bcrypt.hash(request.body.password, salt, async function(err, hash) {
          if (!err) {
            request.body.password_hash = hash;
            await user.createUser(request, response);
          } else {
            console.log("err hash ", err);
            return response.status(401).send({
              success: false,
              message: "Unable to create password hash - Error " + err
            });
          }
        });
      } else {
        console.log("err salt ", err);
        return response.status(401).send({
          success: false,
          message: "Unable to create hash salt - Error " + err
        });
      }
    });
  } else {
    return response.status(401).send({
      success: false,
      message: "User already exists"
    });
  }
};

const authorizeUser = async (request, response) => {
  const userCredentials = await user.checkUserExists(request, response);
  if (userCredentials !== false) {
    bcrypt.compare(
      request.body.password,
      userCredentials.password_hash,
      async function(err, res) {
        if (res && !err) {
          const token = await jwt.sign(userCredentials, process.env.SECRET_KEY);
          await user.updateLogTime(request, response, userCredentials.id); // update last_logged time
          return response.status(200).send({
            success: true,
            authToken: token,
            authUser: {
              id: userCredentials.id,
              username: userCredentials.username,
              full_name: userCredentials.full_name,
              user_role: userCredentials.user_role
            }
          });
        } else {
          return response.status(401).send({
            success: false,
            message: "Invalid credentials"
          });
        }
      }
    );
  } else {
    return response.status(401).send({
      success: false,
      message: "User does not exist"
    });
  }
};

const authorizeMember = async (request, response) => {
  const userCredentials = await user.checkUserExists(request, response);
  if (userCredentials !== false) {
    if (userCredentials.user_role != "Member") {
      return response.status(401).send({
        success: false,
        message: "User does not exist"
      });
    } else {
      bcrypt.compare(
        request.body.password,
        userCredentials.password_hash,
        async function(err, res) {
          if (res && !err) {
            const token = await jwt.sign(
              userCredentials,
              process.env.SECRET_KEY
            );
            await user.updateLogTime(request, response, userCredentials.id); // update last_logged time
            return response.status(200).send({
              success: true,
              authToken: token,
              authUser: {
                id: userCredentials.id,
                username: userCredentials.username,
                full_name: userCredentials.full_name,
                user_role: userCredentials.user_role
              }
            });
          } else {
            return response.status(401).send({
              success: false,
              message: "Invalid credentials"
            });
          }
        }
      );
    }
  } else {
    return response.status(401).send({
      success: false,
      message: "User does not exist"
    });
  }
};

const fetchAuthUser = (request, response) => {
  if (request.user) {
    return response.status(200).send({
      success: true,
      authUser: {
        id: request.user.id,
        username: request.user.username,
        full_name: request.user.full_name,
        user_role: request.user.user_role
      }
    });
  } else {
    return response.status(401).send({
      success: false,
      message: "Invalid token"
    });
  }
};

const resetPassword = async (request, response) => {
  const userCredentials = await user.checkUserExists(request, response);
  if (userCredentials !== false) {
    bcrypt.compare(
      request.body.old_password,
      userCredentials.password_hash,
      async function(err, res) {
        if (res && !err) {
          await bcrypt.genSalt(10, function(err, salt) {
            if (!err) {
              bcrypt.hash(request.body.new_password, salt, async function(
                err,
                hash
              ) {
                if (!err) {
                  request.body.password_hash = hash;
                  request.body.id = userCredentials.id;
                  await user.resetPassword(request, response);
                } else {
                  console.log("err hash ", err);
                  return response.status(401).send({
                    success: false,
                    message: "Unable to create password hash - Error " + err
                  });
                }
              });
            } else {
              console.log("err salt ", err);
              return response.status(401).send({
                success: false,
                message: "Unable to create hash salt - Error " + err
              });
            }
          });
        } else {
          return response.status(401).send({
            success: false,
            message: "Invalid password"
          });
        }
      }
    );
  } else {
    return response.status(401).send({
      success: false,
      message: "User does not exist"
    });
  }
};

module.exports = {
  registerUser,
  authorizeUser,
  authorizeMember,
  fetchAuthUser,
  resetPassword
};
