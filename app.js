// // importando o módulo http
// const http = require('http');

// importando o módulo express
const express = require("express");

const path = require("path");

const app = express();

// Importing database with sequelize
const sequelize = require("./util/database");

//Setando no express a template engine EJS como a padrão
app.set("view engine", "ejs");

//Setando no express a template engine pug como a padrão
// app.set('view engine', 'pug')

//Indicando ao express onde se encontram as views do template engine
app.set("views", "views");

//importando a rota do admin.js
const adminRoutes = require("./routes/admin");

//importanto a rota do shop.js
const shopRoutes = require("./routes/shop");

//Importando o error Controller
const errorController = require("./controllers/error");

//O framework body parser está deprecado, mas utilizamos o urlencoded do próprio express.js para decodificar o forumlário enviado
app.use(express.urlencoded({ extended: true }));

//Criando um middleware estático, assim, todas as requisições da página buscarão no public (por exemplo o CSS)
app.use(express.static(path.join(__dirname, "public")));

//Adicionando um caminho como parâmetro da rota
app.use("/admin/", adminRoutes);
app.use(shopRoutes);

//Em caso de página não encontrada
app.use(errorController.get404);

//Sync is a function to create the tables if they are not created and then connect to server
sequelize
  .sync()
  .then((result) => {
    // console.log(result);
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });

//substituindo o create server

// const server = http.createServer(app);

// // O método listen deixa o servidor apto a receber pedidos para responder
// server.listen(3000)
