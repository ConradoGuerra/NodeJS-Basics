//Importing mongoose
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Creating a user schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    //We can create everything in mongoose object, even documents
    //Here we create in items an array with object that has a productId and the quantity, the productId has the characteristic of mongodb id's
    items: [
      {
        //Create a relation to model product
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

//Methods is an object that grant the possibility to create our own methods from userSchema instance
userSchema.methods.addToCart = function (product) {
  //Searching for the cart product index, this refer to class
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  //If cartProductIndex exists then will be increased the quantity to the existed
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;

    //If not, then the new cart item will be added to the array
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: 1,
    });
  }

  const updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart

  return this.save()
};

userSchema.methods.removeFromCart = function(productId){
      //Filtering all the products there are not the one who we want to delete
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });

    this.cart.items = updatedCartItems
    return this.save()

}

userSchema.methods.clearCart = function(){
  this.cart.items = []
  return this.save()

}

//Exporting our created schema to a model, a model connect the schema to a name, in this case, "User"
module.exports = mongoose.model("User", userSchema);

// //Importing the access to database
// const getDb = require("../util/database").getDb;

// //Importing mongodb
// const mongodb = require("mongodb");

// //Creating the user class
// class User {
//   constructor(username, email, cart, id) {
//     this.name = username;
//     this.email = email;
//     this.cart = cart;
//     this._id = id;
//   }

//   //Method to create user
//   save() {
//     //Connecting to database
//     const db = getDb();

//     //Connecting/creating the collection users and inserting a document (register) of the user created
//     return db
//       .collection("users")
//       .insertOne(this)
//       .then(() => console.log("User created"))
//       .catch((err) => console.log(err));
//   }

//   //Method to add a product to cart
//   addToCart(product) {
//     //Searching for the cart product index
//     const cartProductIndex = this.cart.items.findIndex((cp) => {
//       return cp.productId.toString() === product._id.toString();
//     });

//     let newQuantity = 1;
//     const updatedCartItems = [...this.cart.items];

//     //If cartProductIndex exists then will be increased the quantity to the existed
//     if (cartProductIndex >= 0) {
//       newQuantity = this.cart.items[cartProductIndex].quantity + 1;
//       updatedCartItems[cartProductIndex].quantity = newQuantity;

//       //If not, then the new cart item will be added to the array
//     } else {
//       updatedCartItems.push({
//         productId: new mongodb.ObjectId(product._id),
//         quantity: 1,
//       });
//     }

//     const updatedCart = {
//       items: updatedCartItems,
//     };

//     const db = getDb();
//     return db.collection("users").updateOne(
//       { _id: new mongodb.ObjectId(this._id) },
//       //Now we update the users collection, adding the product to the cart document
//       { $set: { cart: updatedCart } }
//     );
//   }

//   //Method to send the products to the cart
//   getCart() {
//     const db = getDb();

//     //Getting the products id from carts
//     const productIds = this.cart.items.map((i) => {
//       return i.productId;
//     });
//     return (
//       db
//         .collection("products")
//         //Searching the products where the id in at array productIds
//         .find({ _id: { $in: productIds } })
//         //Converting the result to an array
//         .toArray()
//         .then((products) => {
//           //With the result of the products found, I will create an object with the products and a key with quantity
//           return products.map((p) => {
//             return {
//               ...p,
//               //But to find the quantity of the respective products, I have to search at cart items the items that id is equal the id in products
//               quantity: this.cart.items.find((i) => {
//                 return i.productId.toString() === p._id.toString();
//               }).quantity,
//             };
//           });
//         })
//     );
//   }

//   //Method to delete the items from cart
//   deleteItemFromCart(productId) {
//     //First we filter all the products there are not the one who we want to delete
//     const updatedCartItems = this.cart.items.filter((item) => {
//       return item.productId.toString() !== productId.toString();
//     });

//     const db = getDb();
//     return (
//       db
//         .collection("users")
//         //Now we update our cart items with the new items, which not have the item deleted
//         .updateOne(
//           { _id: new mongodb.ObjectId(this._id) },
//           { $set: { cart: { items: updatedCartItems } } }
//         )
//     );
//   }

//   //Method to create order from products in the cart
//   addOrder() {
//     const db = getDb();
//     //Searching for the products detail to increase details at orders list
//     return (
//       this.getCart()
//         .then((products) => {
//           const order = {
//             //Giving the products details to the items key
//             items: products,
//             //Giving user id and useranme to user key
//             user: {
//               _id: new mongodb.ObjectId(this._id),
//               name: this.name,
//             },
//           };
//           return (
//             db
//               //insert the object in the cart at collection orders
//               .collection("orders")
//               .insertOne(order)
//           );
//         })
//         //The result of this function will be an empty cart
//         .then((result) => {
//           this.cart = { items: [] };
//           return db
//             .collection("users")
//             .updateOne(
//               { _id: new mongodb.ObjectId(this._id) },
//               { $set: { cart: { items: [] } } }
//             );
//         })
//     );
//   }

//   //Method to get the items are in the orders
//   getOrders() {
//     const db = getDb();
//     return db
//       .collection("orders")
//       //Here we are searhing for the user order list with a parameter nested in the document
//       .find({ 'user._id': new mongodb.ObjectId(this._id) })
//       .toArray();
//   }

//   //Method to find the user
//   static findById(userId) {
//     //Connecting to database
//     const db = getDb();

//     //Searching for the user by id
//     return (
//       db
//         //Connecting to the collection users
//         .collection("users")
//         //Searching the document of the userId
//         //Now we convert the string ID to an JS object
//         .findOne({ _id: new mongodb.ObjectId(userId) })
//         .then((user) => {
//           console.log(user);
//           //I have to return the user with all information
//           return user;
//         })
//         .catch((err) => console.log(err))
//     );
//   }
// }

// module.exports = User;
