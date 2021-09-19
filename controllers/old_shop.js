//Import the class Product
const Product = require("../models/product");
const Cart = require("../models/cart");

//Controller get to list the products
exports.getProducts = (req, res, next) => {
  // I dont want to create a new product, just get all the products are there
  Product.fetchAll((products) => {
    //Render é um função do express.js que renderiza o template engine setado na página principal (no nosso caso o handlebars)
    res.render("shop/product-list", {
      prods: products,
      pageTitle: "All Products",
      path: "/products",
    });
  });
};

//Controller get, to get the product ID
exports.getProduct = (req, res, next) => {
  //Assigning to a variable the product ID from request paramater
  const prodId = req.params.productId;

  //using the class and the static function to find the product ID
  Product.findById(prodId, (product) => {
    //rendering the page sending the product to page with keys and values
    res.render("shop/product-detail", {
      product: product,
      pageTitle: "Product",
      path: "/products",
    });
  });
};

//Controller get to list the products
exports.getIndex = (req, res, next) => {
  // I dont want to create a new product, just get all the products are there
  Product.fetchAll((products) => {
    //Render é um função do express.js que renderiza o template engine setado na página principal (no nosso caso o handlebars)
    res.render("shop/index", {
      prods: products,
      pageTitle: "Shop",
      path: "/",
    });
  });
};

exports.getCart = (req, res, next) => {
  //Looking if there is anything in the cart
  Cart.getCart((cart) => {
    //Looking for products
    Product.fetchAll((products) => {
      const cartProducts = [];
      //If there is a product in the cart, then the array will have the product details and quantity
      for (product of products) {
        const cartProductData = cart.products.find(
          (prod) => prod.id === product.id
        );
        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartProducts,
      });
    });
  });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.addProduct(prodId, product.price);
  });
  res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, (product) => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect("/cart");
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    path: "/orders",
    pageTitle: "Your Orders",
  });
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
