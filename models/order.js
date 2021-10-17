//Importing mongoose
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

//Creating a order schema
const orderSchema = new Schema({
  user: {
    userId: {
      type: Schema.Types.ObjectId,
      //Here we are making references of userid of model user
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  products: [
    {
      product: {
        type: Object,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);
