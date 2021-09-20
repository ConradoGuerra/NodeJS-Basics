//Import sequelize library
const Sequelize = require('sequelize');

//Import the connection to database
const sequelize = require('../util/database')

//Creating a product with sequelize method to create a table in db
const Product = sequelize.define('product', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: Sequelize.STRING,
    price: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING
    }
});

module.exports = Product;