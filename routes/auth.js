//Importing express
const express = require("express");

//Importing auth controller
const authController = require("../controllers/auth");

//Getting the router
const router = express.Router();

const User = require("../models/user");

//Importing directily the function check from express-validator/check
const { check, body } = require("express-validator");

//Connecting the view to controller
router.get("/login", authController.getLogin);

//Connecting the view signup to controller
router.get("/signup", authController.getSignup);

//Connecting the view to controller Login
router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid e-mail")
      .normalizeEmail(),
    body("password", "Please enter a valid password")
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

//Connecting the view to controller
router.post(
  "/signup",
  //Turnin the validation into array
  [
    //Calling the check function to check the email, this will check if there is an email address
    check("email")
      .isEmail()
      .withMessage("Please enter a valid e-mail")
      .custom((value, { req }) => {
        //Searching if the user exists
        return User.findOne({ email: value }).then((userDoc) => {
          //If the e-mail exists, then the promise will be rejected and the users will receive the message below
          if (userDoc) {
            return Promise.reject("E-mail already exists.");
          }
        });
      })
      //Removing extra spaces from the input and uppercases
      .normalizeEmail(),
    //Now i'm extracting the password from body, more especific and send the message as default argument of the function
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters"
    )
      .isLength({ min: 4 })
      .isAlphanumeric()
      .trim(),
    //Check if the passwords matches with custom validation
    body("confirmPassword")
      .custom((value, { req }) => {
        //Value from function is the value of input, and the request is the request middleware
        if (value !== req.body.password) {
          //If does not match, then will be send a message
          throw new Error("The passwords does not match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

//Connecting the view to controller logout
router.post("/logout", authController.postLogout);

//Connecting to view reset
router.get("/reset", authController.getReset);

//Post submit to reset password
router.post("/reset", authController.postReset);

//Regiter to new password
router.get("/reset/:token", authController.getNewPassword);

//Post submit to new password
router.post("/new-password", authController.postNewPassword);

module.exports = router;
