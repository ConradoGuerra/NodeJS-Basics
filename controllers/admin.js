const Product = require("../models/product");

//Controller get para a view add product
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false
  });
};

//Controller post to add product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;

  //Creating new instance of product like an object (creating a product)
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    //Save is a default method from mongoose
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
        product: product
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

  //Searching for the product with mongoose method
  Product.findById(prodId).then(product => {
    //Assigning the updated values to the product found by mongoose method
    product.title = updatedTitle
    product.description = updatedDescription
    product.price = updatedPrice
    product.imageUrl = updatedImageUrl
    //With the product class we can use all the mongoose functions
    return product.save()
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
  //Get all the products with mongoose method
  Product.find()
    // //I can select witch field to display
    // .select('title price -_id')
    // //And i can select the fields of the related document
    // .populate('userId', 'name')
    .then((products) => {
      console.log(products)
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products"
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//Controller to delete a product
exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //Delete a product with mongoose method
  Product.findByIdAndDelete(prodId)
    .then(() => {
      console.log("Deleted Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
