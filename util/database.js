//Import mongoDB
const mongodb = require("mongodb");

//Extracting mongoClient constructor
const MongoClient = mongodb.MongoClient;

//Creating a variable to access the database
let _db;

//Connecting to mongodb database with a callback function
//We use the url is in the atlas cluster page in cloud mongodb
const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://conrado:262800@cluster0.gpslw.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log("Connected!");

      //Client db will connect to the database besides "mongodb.net/", will connect to SHOP in our case, i can change the declaring the database name into the function
      _db = client.db()
      callback()
    })
    .catch((err) => console.log(err));
};

//Function to check if database base was created, then will return the access to database
const getDb = () => {
  if(_db){
    return _db
  }
  throw 'No database found!'
}

//Exporting the connecting to database and storing the connection and this will keep on running because its a server
exports.mongoConnect = mongoConnect;

//Exporting the method that access to that database 
exports.getDb = getDb
