const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Checkout
router.post("/checkout", async (req, res) => {
  try {
    const { userId } = req.body;

    const cartItems = await Cart.find({ userId });

    let items = [];
    let total = 0;

    for (let item of cartItems) {
      const product = await Product.findById(item.productId);

      if (product) {
        items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: item.quantity
        });

        total += product.price * item.quantity;
      }
    }

    // Get all orders for a user
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


    const order = new Order({
      userId,
      items,
      total
    });

    await order.save();

    // CLEAR CART AFTER CHECKOUT
    await Cart.deleteMany({ userId });

    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
