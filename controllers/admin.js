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
  //As  I declare in app.js that products belongs do user, a product has many users
  // Now I can use the createProduct method to create a product with userId as foreingKey without expressing that in function
  req.user
    //With the sequelize association i can use special methods of associated (products belongs to user)
    .createProduct({
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

  //Sequelize association
  req.user
    .getProducts({ where: { id: prodId } })
    //Searching the id findByPk is a method of sequelize to search a register with where clause
    // Product.findByPk(prodId)
    .then((products) => {
      const product = products[0]
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
  //I only want the products from the exactly user, not all
  req.user.getProducts()
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
