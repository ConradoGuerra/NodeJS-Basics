//Importing User model
const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  //Getting the cookie was sent with the request from the application
  // const isLoggedIn = req.get("Cookie").split(";")[5].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

exports.postLogin = (req, res, next) => {
  //Storing the session in the server side
    //Searching the user who has this id
    User.findById("616c4c2bb354df9224d85473")
    .then((user) => {
      req.session.isLoggedIn = true
      //Assigning to user request session the user found by mongoose and its methods
      req.session.user = user;

      //A callback function to be sure that the session was created
      req.session.save((err) => {
        console.log(err)
        res.redirect("/");
      })
    })
    .catch((err) => {
      console.log(err);
    });
};

//Logout controller
exports.postLogout = (req, res, next) => {
  //Destroying the cookie at session and mongodb
  req.session.destroy((err) => {
    console.log(err)
    res.redirect('/')
  })
};
