//Importing the access to the database
const getDb = require("../util/database").getDb;

//Importing mongodb
const mongodb = require("mongodb");

//Creating the product class
class Product {
  constructor(title, price, description, imageUrl, id, userid) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id;
    this.userid = userid;
  }

  //Method to create product
  save() {
    //Connecting to the database
    const db = getDb();

    //Create a db operation
    let dbOp;

    //If the product has Id, then will be update
    if (this._id) {
      //Connecting to the collection products, update one product with the id in the page
      dbOp = db
        .collection("products")
        //UpdateOne is a single update, first argument is the product id, the second parameter is how to update the document
        //We have to describe the operation with "$set" describing the changes we want to make ($set: this) to update for all parameters
        //$set: {title: this.title, price: this.price} for specified parameters
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this });

      //If not, then will be created
    } else {
      //Tell to mongodb which collection i want to connect
      //If doesnt exists, will be created with the data
      dbOp = db
        .collection("products")
        //Calling insertOne because I want to insert just one data, I can insert many if I call method insertMany
        //Example => db.collection('product').insertOne({name: 'A book', price: 12.99})
        //This parameter will bring all the parameters I already declared above in the constructor
        .insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //Static Method to fetch all products in products collection
  static fetchAll() {
    //Connecting to the database
    const db = getDb();
    //Connecting to the products collection
    // db.collection('products')
    //Here I could filter and find all the products which have a title "A book"
    // db.collection('products').find({title: 'A book'})
    //Toarray is method that returns the registers as JS array
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        console.log(products);
        return products;
      })
      .catch((err) => console.log(err));
  }

  //Static Method to find only one product
  static findById(prodId) {
    //Connecting to db collection products
    const db = getDb();
    return (
      db
        .collection("products")
        //Now I want to find only one product, to do that, I have to call new instance to get id in mongodb, after find, I return the document with next method
        //Now we convert the string ID to an JS object
        .find({ _id: new mongodb.ObjectId(prodId) })
        .next()
        .then((product) => {
          console.log(product);
          return product;
        })
        .catch((err) => console.log(err))
    );
  }

  //Static Method to delete a product
  static deleteProduct(prodId) {
    //Connecting to db
    const db = getDb();

    //Connecting to the collection products
    return db.collection("products")
      //Converting the prodId to an object
      .deleteOne({ _id: new mongodb.ObjectId(prodId) })
      .then((result) => console.log("Deleted"))
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
