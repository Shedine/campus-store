const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      location: String
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", orderSchema);
