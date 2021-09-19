//Import the class Product
const Product = require("../models/product");
const Cart = require("../models/cart");

//Controller get to list the products
exports.getProducts = (req, res, next) => {
  // Getting all the products are in the DB
  Product.fetchAll()
    .then(([rows, fieldData]) => {
      res.render("shop/product-list", {
        prods: rows,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//Controller get, to get the product ID
exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(([product]) => {
      res.render("shop/product-detail", {
        product: product[0],
        pageTitle: "Product",
        path: "/products",
      });
    })
    .catch((err) => {
      console(err);
    });
};

//Controller get to list the products
exports.getIndex = (req, res, next) => {
  // Getting all the products are in the DB
  Product.fetchAll(() => {})
    //Using destructuting to send database product registers (rows) to the view
    .then(([rows, fieldData]) => {
      //Render é um função do express.js que renderiza o template engine setado na página principal (no nosso caso o handlebars)
      res.render("shop/index", {
        prods: rows,
        pageTitle: "Shop",
        path: "/",
      });
    })
    //If error
    .catch((err) => {
      console.log(err);
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
