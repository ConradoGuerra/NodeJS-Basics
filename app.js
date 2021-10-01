// // importando o módulo http
// const http = require('http');

// importando o módulo express
const express = require("express");

const path = require("path");

const app = express();

// Importing database with sequelize
const sequelize = require("./util/database");

//Importing model
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

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

//Register a new middleware to give the possibility to use User at the intire application
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      //Saving the sequelize user (with methods and functions, like create, save, destroy) to store in a request object
      //Now we can use the method user at application
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

//Em caso de página não encontrada
app.use(errorController.get404);

//A product belongs to user, a user created the product
//If a user is deleted, the product should be delected too
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });

//One user has many products
User.hasMany(Product)

//A user has one cart
//This setup will add new id (userid) field to the table cart
User.hasOne(Cart)
Cart.belongsTo(User)

//This cart belongs to many products
//A cart can have many products and a product can have multiple carts
//The through parameter create in CartItem table the foreing keys CartId and ProductId
Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})

//Many orders belong to a user, and many users do not belong to a order
User.hasMany(Order)
Order.belongsTo(User)

//Many orders belongs to many products
Order.belongsToMany(Product, {through: OrderItem})

//Sync is a function to create the tables if they are not created and then connect to server
.sequelize
//The force parameter recriate all tables when sequelize begins 
// .sync({force: true})
.sync()
.then((result) => {
  //Select the user at DB
  return User.findByPk(1);
  // console.log(result);
})
.then((user) => {
  //If there isnt a user, then will be created one
  if (!user) {
    return User.create({ name: "Concon", email: "concon@concs.br" });
  }
  return user;
})
.then((user) => {
  return user.createCart()
}).then(cart => {
  //Listen to server
  app.listen(3000);
  
})
.catch((err) => {
  console.log(err);
});

//substituindo o create server

// const server = http.createServer(app);

// // O método listen deixa o servidor apto a receber pedidos para responder
// server.listen(3000)
