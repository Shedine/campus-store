const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// CHECKOUT
router.post("/checkout", async (req, res) => {
  try {
    const { userId, location } = req.body;

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

    const order = new Order({
      userId,
      items,
      totalAmount: total
    });

    await order.save();

    await Cart.deleteMany({ userId });

    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ORDERS (OUTSIDE)
router.get("/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get("/admin/all", async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

router.put("/:id/status", async (req, res) => {
    const { status } = req.body;

    await Order.findByIdAndUpdate(req.params.id, { status });

    res.json({ message: "Status updated" });
});


module.exports = router;
