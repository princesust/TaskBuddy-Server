const User = require("../models/UserModel");
const { body, validationResult, check } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// User Schema
function UserData(data) {
  this.id = data._id;
  this.name = data.name;
  this.latitude = data.latitude;
  this.longitude = data.longitude;
  this.avatar = data.avatar;
  this.activeStatus = data.activeStatus;
}

/**
 * User List.
 *
 * @returns {Object}
 */
exports.userList = [
  function(req, res) {
    try {
      User.find().then(users => {
        if (users.length > 0) {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            users
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            []
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * User Detail.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.userDetail = [
  function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.successResponseWithData(res, "Operation success", {});
    }
    try {
      User.findOne({ _id: req.params.id }).then(user => {
        if (user !== null) {
          let userData = new UserData(user);
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            userData
          );
        } else {
          return apiResponse.successResponseWithData(
            res,
            "Operation success",
            {}
          );
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * User create.
 *
 * @param {string}      name
 * @param {number}      latitude
 * @param {number}      longitude
 * @param {string}      avatar
 * @returns {Object}
 */
exports.userCreate = [
  body("name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),
  body("latitude", "Latitude must be a number.")
    .isNumeric()
    .toFloat(),
  body("longitude", "Longitude must be a number.")
    .isNumeric()
    .toFloat(),
  //check("latitude").isNumeric(),
  ///check("longitude").isNumeric(),
  (req, res) => {
    try {
      const errors = validationResult(req);
      let user = new User({
        name: req.body.name,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        avatar: req.body.avatar,
        activeStatus: 1
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        //Save User.
        user.save(function(err) {
          if (err) {
            return apiResponse.ErrorResponse(res, err);
          }
          let userData = new UserData(user);
          return apiResponse.successResponseWithData(
            res,
            "User add Success.",
            userData
          );
        });
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * User update.
 *
 * @param {string}      name
 * @param {number}      latitude
 * @param {number}      longitude
 * @param {string}      avatar
 *
 * @returns {Object}
 */
exports.userUpdate = [
  body("name", "Name must not be empty.")
    .isLength({ min: 1 })
    .trim(),

  (req, res) => {
    try {
      const errors = validationResult(req);
      let user = {};
      user["name"] = req.body.name;
      if (req.body.latitude) {
        user["latitude"] = req.body.latitude;
      }
      if (req.body.longitude) {
        user["longitude"] = req.body.longitude;
      }
      if (req.body.avatar) {
        user["avatar"] = req.body.avatar;
      }
      if (req.body.activeStatus) {
        user["activeStatus"] = req.body.activeStatus;
      }

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(
            res,
            "Invalid Error.",
            "Invalid ID"
          );
        } else {
          User.findById(req.params.id, function(err, foundUser) {
            if (foundUser === null) {
              return apiResponse.notFoundResponse(
                res,
                "User does not exist with this id"
              );
            } else {
              //update user.
              User.findOneAndUpdate({ _id: req.params.id }, user, {}, function(
                err,
                doc
              ) {
                if (err) {
                  return apiResponse.ErrorResponse(res, err);
                } else {
                  // console.log(doc);
                  // let userData = new UserData(doc);
                  global.io.emit("user_location_update", doc);
                  return apiResponse.successResponseWithData(
                    res,
                    "User update Success.",
                    doc
                  );
                }
              });
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * User Delete.
 *
 * @param {string}      id
 *
 * @returns {Object}
 */
exports.userDelete = [
  function(req, res) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return apiResponse.validationErrorWithData(
        res,
        "Invalid Error.",
        "Invalid ID"
      );
    }
    try {
      User.findById(req.params.id, function(err, foundUser) {
        if (foundUser === null) {
          return apiResponse.notFoundResponse(
            res,
            "User does not exist with this id"
          );
        } else {
          //delete user.
          User.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
              return apiResponse.ErrorResponse(res, err);
            } else {
              return apiResponse.successResponse(res, "User delete Success.");
            }
          });
        }
      });
    } catch (err) {
      //throw error in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
