// importando o módulo express
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require('https')
//Importing mongoose
const mongoose = require("mongoose");
//Importing session
const session = require("express-session");
//Importing mongodb store and passing session to the function which comes with the import
const MongoDBStore = require("connect-mongodb-session")(session);
//Importing CSRD package
const csrf = require("csurf");
//Importing connect flash
const flash = require("connect-flash");
// //Importando o error Controller
const errorController = require("./controllers/error");
//Importing User model
const User = require("./models/user");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

//Importing multer
const multer = require("multer");

const MONGODB_URI =
  //process.env is object that give all environment variable access
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.gpslw.mongodb.net/${process.env.MONGO_DATABASE}`;

const app = express();

//Using mongo db store to yield a constructor function
const store = new MongoDBStore({
  //Connection string URL
  uri: MONGODB_URI,
  //Defining a collection
  collection: "sessions",
});

//Initializing csrf protection
const csrfProtection = csrf();

//The fileSync function will block the code until it's done
const privateKey = fs.readFileSync('server.key')
const certificate = fs.readFileSync('server.cert')

//Storage engine of multer to config how the file will be stored in the system
const fileStorage = multer.diskStorage({
  //The destination is where i want to save the file
  destination: (req, file, cb) => {
    //First argument is if there is an error, the second is the directory
    cb(null, "images");
  },
  //First argument it is for an eventual error and the second is the filename
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

app.set("view engine", "ejs");
//Indicando ao express onde se encontram as views do template engine
app.set("views", "views");

//Filtering the type of file
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//Creating a file to log
const accessLogStream = fs.createWriteStream(
  //Will be create in the root directory
  path.join(__dirname, "access.log"),
  //Flags to a means that will always be created new data, not overwrited
  { flags: "a" }
);

// //importando a rota do admin.js
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
//Using helmet for headers
app.use(helmet());
//Using compression to compressing the page
app.use(compression());
//Using morgan as an request/resposne logging
app.use(morgan("combined", {stream: accessLogStream}));

//O framework body parser está deprecado, mas utilizamos o urlencoded do próprio express.js para decodificar o forumlário enviado
app.use(express.urlencoded({ extended: true }));

//Using multer to handle the parser of files
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

//Criando um middleware estático, assim, todas as requisições da página buscarão no public (por exemplo o CSS)
app.use(express.static(path.join(__dirname, "public")));

//Creating a static middleware, thus all requisition of app will search for images
//The first argument is, if there is a folder with "/images", then the static will serve from that folder
app.use("/images", express.static(path.join(__dirname, "images")));

//Register a middleware and pass the session to config the session setup
app.use(
  session({
    //Signing the has to secretly stores the ID in cookie
    secret: "my secret",
    //Resave, the section will only save if something change
    resave: false,
    //Unitialized false
    saveUninitialized: false,
    //Store means where the cookie will be store, in our case, at mongodb
    store: store,
  })
);

//Using the CSRF after the session
app.use(csrfProtection);

//Initializing flash
app.use(flash());

//Creating a local response to send to the views
app.use((req, res, next) => {
  //This local variable is for autehtication
  res.locals.isAuthenticated = req.session.isLoggedIn;
  //This local variable is for the token
  res.locals.csrfToken = req.csrfToken();
  next();
});

//Register a new middleware to give the possibility to use User at the intire application
app.use((req, res, next) => {
  //If does not exists the user, then call the next middleware
  if (!req.session.user) {
    return next();
  }
  //Searching the user who has this id
  User.findById(req.session.user._id)
    .then((user) => {
      //If the user doesnt exist in mongodb
      if (!user) {
        return next();
      }
      //Assigning to user request the user found by mongoose and its methods
      req.user = user;
      next();
    })
    //If we have a technical issue, we throw an error
    .catch((err) => {
      //Inside of middleware we have to call next with error to throw an error, this next call the middleware error
      next(new Error(err));
    });
});

//Adicionando um caminho como parâmetro da rota
app.use("/admin/", adminRoutes);
app.use(shopRoutes);

//Using the auth routes
app.use(authRoutes);

// Technical error render
app.get("/500", errorController.get500);

// Page not found error render
app.use(errorController.get404);

//Error middleware is a special middleware that receives priority if an error occurs
app.use((error, req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

//Connecting to mongo db through mongoose
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    //Create a server with the privateKey and certificate
    // https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000);
    //Executing app.listen to bring the node server
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
