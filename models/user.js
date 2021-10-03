//Importing the access to database
const getDb = require("../util/database").getDb;

//Importing mongodb
const mongodb = require("mongodb");

//Creating the user class
class User {
  constructor(username, email) {
    this.name = username;
    this.email = email;
  }

  //Method to create user
  save() {
    //Connecting to database
    const db = getDb();

    //Connecting/creating the collection users and inserting a document (register) of the user created
    return db
      .collection("users")
      .insertOne(this)
      .then(() => console.log("User created"))
      .catch((err) => console.log(err));
  }

  //Method to find the user
  static findById(userId) {
    //Connecting to database
    const db = getDb();

    //Searching for the user by id
    return (
      db
        //Connecting to the collection users
        .collection("users")
        //Searching the document of the userId
        //Now we convert the string ID to an JS object
        .findOne({ _id: new mongodb.ObjectId(userId) })
        .then((user) => {
          console.log(user);
          //I have to return the user with all information
          return user
        })
        .catch((err) => console.log(err))
    );
  }
}

module.exports = User;
