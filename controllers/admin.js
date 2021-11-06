const Product = require("../models/product");

const { validationResult } = require("express-validator");

const fileHelper = require("../util/file");

//Controller get para a view add product
exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

//Controller post to add product
exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  //Assining the uploaded image
  const image = req.file;

  //If no image was updated nor the type of an image
  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: "Attached file is not an image",
      validationErrors: [],
    });
  }

  //Getting the path from the object image
  const imageUrl = image.path;

  //Getting the result of the validation in the routes
  const errors = validationResult(req);

  //If the error exists
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  //Creating new instance of product like an object (creating a product)
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    //Save is a default method from mongoose
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      // res.redirect('/500')
      //Handling with errors, sending a message of the technical issue
      // console.log(err);
      // //Code indicating server side issue
      // return res.status(500).render("admin/edit-product", {
      //   pageTitle: "Add Product",
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   product: {
      //     title: title,
      //     price: price,
      //     description: description,
      //     imageUrl: imageUrl,
      //   },
      //   errorMessage: 'Database operation failed, please try again',
      //   validationErrors: [],
      // });

      //Throwing the error and status error to a variable and return as argument in the next middleware
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
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
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  //Assigning the page file
  const updatedImageUrl = req.file;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;

  //Getting the result of the validation in the routes
  const errors = validationResult(req);

  //If the error exists
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      hasError: true,
      product: {
        title: updatedTitle,
        price: updatedImageUrl,
        description: updatedDescription,
        _id: prodId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  //Searching for the product with mongoose method
  Product.findById(prodId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      //Assigning the updated values to the product found by mongoose method
      product.title = updatedTitle;
      product.description = updatedDescription;
      product.price = updatedPrice;
      //If the image is not undefined, then the user changed the image
      if (updatedImageUrl) {
        //Deleting the old file
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = updatedImageUrl;
      }
      //With the product class we can use all the mongoose functions
      return product.save().then((result) => {
        //If the save method was succeed
        console.log("Updated Product");
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  //Get all the products with mongoose method
  Product.find({ userId: req.user._id })
    // //I can select witch field to display
    // .select('title price -_id')
    // //And i can select the fields of the related document
    // .populate('userId', 'name')
    .then((products) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

//Controller to delete a product
exports.deleteProduct = (req, res, next) => {
  //Getting the parameter of view
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found!"));
      }
      fileHelper.deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log('Product Deleted')
      res.status(200).json({message: 'Product Deleted'})
    })
    .catch((err) => {
      res.status(500).json({message: 'Deleting product failed'})
    });
};
