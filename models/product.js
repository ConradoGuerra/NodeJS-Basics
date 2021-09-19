const Cart = require("./cart");

const db = require("../util/database");

//Exportando uma classe dos produtos
module.exports = class Products {
  //nomenado um construtor para essa classe
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    return db.execute(
      "INSERT INTO products(title, price, description, imageUrl) values(?, ?, ?, ?)",
      [this.title, this.price, this.description, this.imageUrl]
    );
  }

  static deleteById(id) {}

  //Executing the query to fetch products
  static fetchAll() {
    return db.execute("SELECT * FROM products");
  }

  static findById(id) {
      return db.execute('SELECT * FROM products WHERE products.id = ?', [id])
  }
};
