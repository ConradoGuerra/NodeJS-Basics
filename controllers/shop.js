//Import the class Product
const Product = require("../models/product");

//Controller get to list the products
exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
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
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

//Controller get to list the products
exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Products",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart
        .getProducts()
        .then((products) => {
          res.render("shop/cart", {
            path: "/cart",
            pageTitle: "Your Cart",
            products: products,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
  //Looking if there is anything in the cart
  // Cart.getCart((cart) => {
  //   //Looking for products
  //   Product.fetchAll((products) => {
  //     const cartProducts = [];
  //     //If there is a product in the cart, then the array will have the product details and quantity
  //     for (product of products) {
  //       const cartProductData = cart.products.find(
  //         (prod) => prod.id === product.id
  //       );
  //       if (cartProductData) {
  //         cartProducts.push({ productData: product, qty: cartProductData.qty });
  //       }
  //     }

  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  let fetchedCart;
  let newQuantity = 1;

  //First we have to search the user's cart
  req.user
    .getCart()
    .then((cart) => {
      //FetchedCart get all the information of table
      fetchedCart = cart;
      //Now we search if the cart has the productID
      return cart.getProducts({ where: { id: prodId } });
    })
    //Then, with the result of the last search, if product is added, then product will receive the first element of products (data)
    .then((products) => {
      let product;
      //If we do have product
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        //Here we query the table product with cartItem join to know the quantity of products at cart item table
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      //Here we search at product table the general data of the product, then we add its id and quantity to our cart
      return Product.findByPk(prodId);
    })
    //If we do have products at cart item, then we be incremented the quantity to the old one
    .then((product) => {
      fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  //Fisrt we search the users cart
  req.user
    .getCart()
    //then we search the products at the cart item with the selected id
    .then((cart) => {
      return cart.getProducts({ where: { id: prodId } });
      //then we attribute to a variable the result of this search (data) and delete from database
    })
    //Now we use the function destroy to delete the product id from DB
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  //First we get the user's cart
  req.user
    .getCart()
    //Then we get the products are in the cart
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      //With the products in the cart of this user, we will create a order with the user id
      return (
        //Now we have create a order with userid
        req.user
          .createOrder()
          //To create the orderList we need the products were in cartList
          .then((order) => {
            order.addProducts(
              //Here we use map function, we will add products in order list table, the map function get an array, treats that and give a modified array as result
              //That is, map get the list of products, as array, and treat that, one by one
              //So we get the products at cartlist, one by one, and refresh its quantity
              products.map((product) => {
                //Now we go to orderItem model and assign new quantity to that product in orderItem table
                product.orderItem = { quantity: product.cartItem.quantity };
                return product;
              })
            );
          })
          .catch((err) => console.log(err))
      );
    })
    //When the user order the product, then the cart will be emptied
    .then((result) => fetchedCart.setProducts(null))
    .then((result) => res.redirect("/orders"))
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    //Here we have a concept called eager loading, we are calling an array with products (this happens because a order belong to many products) to the query order
    .getOrders({include: ['products']})
    .then(orders => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders
      });

    })
    .catch((err) => console.log(err));
};
