//Importing User model
const User = require("../models/user");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
//Validation Result allow to gather all the erros prior to validation check stored
const { validationResult } = require("express-validator");

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
    oldLogin: {
      email: '',
      password: ''
    },
    validationErrors: []
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
    oldSignup: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  //Extracting the user's email and password
  const email = req.body.email;
  const password = req.body.password;
    //We are extracting the error from the middleware function check, in the post login route, getting the request as argument
    const errors = validationResult(req);
    //If errors is not empty
    if (!errors.isEmpty()) {
      //This status is for validation error
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "login",
        errorMessage: errors.array()[0].msg,
        oldLogin: {
          email: email,
          password: password
        },
        //Sending to view the error as an array
        validationErrors: errors.array()
      });
    }
  //Searching for the user by its email
  User.findOne({ email: email })
    .then((user) => {
      //If the user does not exist, then will be redirect to login
      if (!user) {
        //This status is for validation error
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: 'Invalid e-mail or password',
          oldLogin: {
            email: email,
            password: password
          },
          //Sending to view the error as an array
          validationErrors: []
        });
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
        
        //This status is for validation error
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "login",
          errorMessage: 'Invalid e-mail or password',
          oldLogin: {
            email: email,
            password: password
          },
          //Sending to view the error as an array
          validationErrors: []
        })
        //If passwords do not matches
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

exports.postSignup = (req, res, next) => {
  //Getting the e-mail and password from signup page
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  //We are extracting the error from the middleware function check, in the post signup route, getting the request as argument
  const errors = validationResult(req);
  //If errors is not empty
  if (!errors.isEmpty()) {
    console.log(errors.array())
    //This status is for validation error
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldSignup: {
        email: email,
        password: password,
        confirmPassword: confirmPassword
      },
      //Sending as object the array of erros to use at the view
      validationErrors: errors.array()
    });
  }
  //If not, we will encript (hash) the password, the second argument is the number of rounds of encription
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
        .catch((err) => {
          const error = new Error(err)
          error.httpStatusCode = 500
          return next(error)
        });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
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
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        //Sending an email
         transporter.sendMail({
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
      .catch((err) => {
        const error = new Error(err)
        error.httpStatusCode = 500
        return next(error)
      });
  });
};

//New Password view
exports.getNewPassword = (req, res, next) => {
  //Retrieving the token from the parameters
  const token = req.params.token;

  //Seraching for the user with the token and is it valid
  User.findOne({
    resetToken: token,
    //Here we are looking if resetTokenExpiration is newer then now, GT stands for "greater than"
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      let message = req.flash("error");
      if (message) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        token: token,
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};

//New password post request
exports.postNewPassword = (req, res, next) => {
  //Extracting the password, userid and token from view
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token;
  let resetUser;
  //Searching for the user with this where clause
  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      //If found, then the new password will be hashed
      resetUser = user;
      //Hashing the password
      return bcryptjs.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      //Assigning the new password
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      return next(error)
    });
};
