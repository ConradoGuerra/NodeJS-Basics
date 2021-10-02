const Product = require("../models/product");

//Importing mongodb
const mongodb = require('mongodb')

//Importing ObjectId class from mongodb to search product id correctly
const ObjectId = mongodb.ObjectId

//Controller get para a view add product
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

//Controller post to add product
exports.postAddProduct = (req, res) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;

  const product = new Product(title, price, description, imageUrl);
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

//Controller get for view edit product
exports.getEditProduct = (req, res, next) => {
  //Here we get the param of URL
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  //Get the param sent with get
  const prodId = req.params.productId;

  //Searching the product
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }

      //if id exists
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  //Creating new instance of product to update
  const product = new Product(updatedTitle, updatedPrice, updatedDescription, updatedImageUrl, new ObjectId(prodId));

  //Calling the method to update
  product.save()
    //If the save method was succeed
    .then((result) => {
      console.log("Updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  //Get all the products
  Product.fetchAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findByPk(prodId)
//     .then((product) => {
//       return product.destroy();
//     })
//     .then((result) => {
//       console.log("Deleted Product");
//       res.redirect("/admin/products");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };
