// // importando o módulo http
// const http = require('http');

// importando o módulo express
const express = require("express");

const path = require("path");

const app = express();

//Importing mongoose
const mongoose = require("mongoose");

//Importing User model
const User = require("./models/user");

//Setando no express a template engine EJS como a padrão
app.set("view engine", "ejs");

//Indicando ao express onde se encontram as views do template engine
app.set("views", "views");

// //importando a rota do admin.js
const adminRoutes = require("./routes/admin");

// //importanto a rota do shop.js
const shopRoutes = require("./routes/shop");

const authRoutes = require('./routes/auth')

// //Importando o error Controller
const errorController = require("./controllers/error");

//Register a new middleware to give the possibility to use User at the intire application
app.use((req, res, next) => {
  //Searching the user who has this id
  User.findById("616c4c2bb354df9224d85473")
    .then((user) => {
      //Assigning to user request the user found by mongoose and its methods
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

//O framework body parser está deprecado, mas utilizamos o urlencoded do próprio express.js para decodificar o forumlário enviado
app.use(express.urlencoded({ extended: true }));

//Criando um middleware estático, assim, todas as requisições da página buscarão no public (por exemplo o CSS)
app.use(express.static(path.join(__dirname, "public")));

//Adicionando um caminho como parâmetro da rota
app.use("/admin/", adminRoutes);
app.use(shopRoutes);

//Using the auth routes
app.use(authRoutes)

// //Em caso de página não encontrada
app.use(errorController.get404);

//Connecting to mongo db through mongoose
mongoose
  .connect(
    "mongodb+srv://conrado:262800@cluster0.gpslw.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then((result) => {
    //Searching if there is a user
    User.findOne().then(user => {
      //If not, then will be created one
      if(!user){
        //Creating a user with mongoose method
        const user = new User({
          name: "Conrado",
          email: "conrado@concon.com",
          cart: { items: [] },
        });
        user.save();
      }
    })
    //Executing app.listen to bring the node server
    app.listen(3000);
  })
  .catch((err) => console.log(err));
