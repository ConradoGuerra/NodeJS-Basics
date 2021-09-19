//importing sequelize library
const Sequelize = require("sequelize");

//Creating a sequelize instance (db name, user, password)
const sequelize = new Sequelize("node-complete", "root", "262800", {
  dialect: "mysql",
  host: "localhost",
});

//exporting sequelize
module.exports = sequelize;
