const Product = require("../models/product");

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
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const price = req.body.price;

  Product.create({
    title: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
    });
};

//Controller get para a view edit product
exports.getEditProduct = (req, res, next) => {
  //Here we get the param of URL
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  //Get the param sent with get
  const prodId = req.params.productId;

  //Searching the id findByPk is a method of sequelize to search a register with where clause
  Product.findByPk(prodId)
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

  Product.findByPk(prodId)
    .then((product) => {
      (product.title = updatedTitle),
        (product.imageUrl = updatedImageUrl),
        (product.description = updatedDescription),
        (product.price = updatedPrice);
      //Returning the update statement
      return product.save();
    })
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
  Product.findAll()
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

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log("Deleted Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
