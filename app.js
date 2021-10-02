// // importando o módulo http
// const http = require('http');

// importando o módulo express
const express = require("express");

const path = require("path");

const app = express();

//Importing mongodb connection
const mongoConnect= require('./util/database').mongoConnect

//Setando no express a template engine EJS como a padrão
app.set("view engine", "ejs");

//Setando no express a template engine pug como a padrão
// app.set('view engine', 'pug')

//Indicando ao express onde se encontram as views do template engine
app.set("views", "views");

// //importando a rota do admin.js
const adminRoutes = require("./routes/admin");

// //importanto a rota do shop.js
const shopRoutes = require("./routes/shop");

// //Importando o error Controller
const errorController = require("./controllers/error");

//Register a new middleware to give the possibility to use User at the intire application
app.use((req, res, next) => {
  // User.findByPk(1)
  //   .then((user) => {
  //     //Saving the sequelize user (with methods and functions, like create, save, destroy) to store in a request object
  //     //Now we can use the method user at application
  //     req.user = user;
  //     next();
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  next()
});

//O framework body parser está deprecado, mas utilizamos o urlencoded do próprio express.js para decodificar o forumlário enviado
app.use(express.urlencoded({ extended: true }));

//Criando um middleware estático, assim, todas as requisições da página buscarão no public (por exemplo o CSS)
app.use(express.static(path.join(__dirname, "public")));

//Adicionando um caminho como parâmetro da rota
app.use("/admin/", adminRoutes);
app.use(shopRoutes);

// //Em caso de página não encontrada
app.use(errorController.get404);

//Executing the mongo connect to connect to database server
//Passing a callback that will be executed once we connect to server
mongoConnect(() => {

  //Executing app.listen to bring the node server
  app.listen(3000)
})
