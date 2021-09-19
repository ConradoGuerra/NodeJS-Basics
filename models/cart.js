//Importing fs and path
const fs = require("fs");
const path = require("path");

//First we create the path where the data is gonna be saved and type of file
const p = path.join(path.dirname(require.main.filename), "data", "cart.json");

//Export the class Cart
module.exports = class Cart {
  //Static function to add Product to cart
  static addProduct(id, productPrice) {
    //Fetch the previous cart
    fs.readFile(p, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      //If exist a produt
      if (!err) {
        cart = JSON.parse(fileContent);
      }
      //Analyze the cart => Find existing product
      //Getting the index of cart.produts
      const existingProductIndex = cart.products.findIndex(
        (prod) => prod.id === id
      );

      //Declaring the product in a variable
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      //If allready exists a produt
      //Add new product / increase quantity
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(p, (err, fileContent) => {
      //If there isnt a product
      if (err) {
        return;
      }
      //Getting the products
      const updatedCart = { ...JSON.parse(fileContent) };
      //Finding the product deleted by id
      const product = updatedCart.products.find((prod) => prod.id === id);
      if (!product) {
        return;
      }
      const productQty = product.qty;

      //If there are produts with not the id of the deleted, they will be remained in cart
      updatedCart.products = updatedCart.products.filter(
        (prod) => prod.id !== id
      );

      //Subtract the cart's price of deleted products
      updatedCart.totalPrice =
        updatedCart.totalPrice - productPrice * productQty;

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(p, (err, fileContent) => {
      const cart = JSON.parse(fileContent);
      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }
};
