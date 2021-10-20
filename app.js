// importando o módulo express
const express = require("express");

const path = require("path");
//Importing mongoose
const mongoose = require("mongoose");

//Importing session
const session = require("express-session");

//Importing mongodb store and passing session to the function which comes with the import
const MongoDBStore = require("connect-mongodb-session")(session);

//Importing User model
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://conrado:262800@cluster0.gpslw.mongodb.net/shop";

const app = express();

//Using mongo db store to yield a constructor function
const store = new MongoDBStore({
  //Connection string URL
  uri: MONGODB_URI,
  //Defining a collection
  collection: "sessions",
});

//Setando no express a template engine EJS como a padrão
app.set("view engine", "ejs");

//Indicando ao express onde se encontram as views do template engine
app.set("views", "views");

// //importando a rota do admin.js
const adminRoutes = require("./routes/admin");

// //importanto a rota do shop.js
const shopRoutes = require("./routes/shop");

const authRoutes = require("./routes/auth");

// //Importando o error Controller
const errorController = require("./controllers/error");

//O framework body parser está deprecado, mas utilizamos o urlencoded do próprio express.js para decodificar o forumlário enviado
app.use(express.urlencoded({ extended: true }));

//Criando um middleware estático, assim, todas as requisições da página buscarão no public (por exemplo o CSS)
app.use(express.static(path.join(__dirname, "public")));


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

//Register a new middleware to give the possibility to use User at the intire application
app.use((req, res, next) => {
  //If does not exists the user, then call the next middleware
  if(!req.session.user){
    return next()
  }
  //Searching the user who has this id
  User.findById(req.session.user._id)
    .then((user) => {
      //Assigning to user request the user found by mongoose and its methods
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

//Adicionando um caminho como parâmetro da rota
app.use("/admin/", adminRoutes);
app.use(shopRoutes);

//Using the auth routes
app.use(authRoutes);

// //Em caso de página não encontrada
app.use(errorController.get404);

//Connecting to mongo db through mongoose
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    //Executing app.listen to bring the node server
    app.listen(3000);
  })
  .catch((err) => console.log(err));
