exports.getLogin = (req, res, next) => {
  //Getting the cookie was sent with the request from the application
  const isLoggedIn = req.get("Cookie").split(";")[5].trim().split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  //Setting a cookie for user
  res.setHeader("Set-Cookie", "loggedIn = true");
  req.isLoggedIn = true;
  res.redirect("/");
};
