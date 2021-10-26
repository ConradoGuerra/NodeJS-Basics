//Importing User model
const User = require("../models/user");

const nodemailer = require("nodemailer");

const sendGridTransport = require("nodemailer-sendgrid-transport");

//Sendgridtransport create a configuration that nodemailer can use sendgrid
const transporter = nodemailer.createTransport(
  sendGridTransport({
    //Configuring the key to send emails
    auth: {
      api_key:
        "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",
    },
  })
);

//Importing bcryptjs
const bcryptjs = require("bcryptjs");

//Importing crypto
const crypto = require("crypto");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  //If the message exists, then will be an array
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  //Getting the cookie was sent with the request from the application
  // const isLoggedIn = req.get("Cookie").split(";")[5].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  //Getting the cookie was sent with the request from the application
  // const isLoggedIn = req.get("Cookie").split(";")[5].trim().split("=")[1];
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  //Extracting the user's email and password
  const email = req.body.email;
  const password = req.body.password;
  //Searching for the user by its email
  User.findOne({ email: email })
    .then((user) => {
      //If the user does not exist, then will be redirect to login
      if (!user) {
        //Flashing an erro message if the user does not exist
        //The flash takes two arguments, first the name of message and the second is the message
        req.flash("error", "Invalid e-mail or password");
        return res.redirect("/login");
      }
      //If exists, then the passwords will be compared if match
      bcryptjs.compare(password, user.password).then((doMatch) => {
        //If the passwords matches
        if (doMatch) {
          //Storing the session in the server side
          req.session.isLoggedIn = true;
          //Assigning to user request session the user found by mongoose and its methods
          req.session.user = user;
          //A callback function to be sure that the session was created
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        //If passwords do not matches
        res.redirect("/login");
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSignup = (req, res, next) => {
  //Getting the e-mail and password from signup page
  const email = req.body.email;
  const password = req.body.password;
  const confirmpassword = req.body.confirmpassword;

  //Searching if the user exists
  User.findOne({ email: email })
    .then((userDoc) => {
      //If exists, then just redirect it to login
      if (userDoc) {
        req.flash("error", "E-mail already exists.");
        return res.redirect("/login");
      }
      //If not, we will encript (hash) the password, the second argument is the number of rounds of encription
      return (
        bcryptjs
          .hash(password, 12)
          //Saving the user with hashedPassword in mongodb
          .then((hashedPassword) => {
            const user = new User({
              email: email,
              password: hashedPassword,
              cart: { items: [] },
            });
            return user
              .save()
              .then((result) => {
                res.redirect("/login");

                //Sending an email
                return transporter.sendMail({
                  to: email,
                  from: "conradoguerra@gmail.com",
                  subject: "Signup succeeded",
                  html: "<h1>You successfully signup!</h1>",
                });
              })
              .catch((err) => console.log(err));
          })
      );
    })
    .catch((err) => console.log(err));
};

//Logout controller
exports.postLogout = (req, res, next) => {
  //Destroying the cookie at session and mongodb
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//Reset Password view
exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message) {
    message = message[0];
  } else {
    message = null;
  }
  //Getting the cookie was sent with the request from the application
  // const isLoggedIn = req.get("Cookie").split(";")[5].trim().split("=")[1];
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    //Creating the token that go to database and confirms the user
    const token = buffer.toString("hex");

    //Storing the token in the user database
    User.findOne({ email: req.body.email })
      .then((user) => {
        //If the user does not exists
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }
        //Setting the user token
        user.resetToken = token;
        //Setting the token expiration to 1 hour after the email was sented
        user.resetTokenExpiration = Date.now() + 3600000;
        //Update in the user database
        user.save();
      })
      .then((result) => {
        res.redirect('/')
        //Sending an email
        return transporter.sendMail({
          //Getting the email that exists
          to: req.body.email,
          from: "conradoguerra@gmail.com",
          subject: "Password reset",
          //Sending the e-mail with the token
          html: `
          <p>You requested a password reset.</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password.</p>`,
        });
      })
      .catch((err) => console.log(err));
  });
};
