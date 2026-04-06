// backend/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    
    const { userId, productId, quantity } = req.body;

    // Optional: check if product exists
    const existingItem= await Cart.findOne({ userId, productId});

    if (existingItem) {
    existingItem.quantity += quantity;
    await existingItem.save();
} else {
    const cartItem = new Cart({ userId, productId, quantity });
    await cartItem.save();
}
    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cart items for user
router.get("/:userId", async (req, res) => {
  try {
    const cartItems = await Cart.find({ userId: req.params.userId }).populate("productId");
    const detailedCart = cartItems.map(item => ({
      _id: item._id,
      productId: item.productId._id,
      name: item.productId.name,
      price: item.productId.price,
      image: item.productId.image,
      quantity: item.quantity,
      total: item.quantity * item.productId.price
    }));
    res.json(detailedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item
router.delete("/remove/:id", async (req, res) => {
  await Cart.findByIdAndDelete(req.params.id);
  res.json({ message: "Item removed" });
});

// Update quantity
router.put("/update/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Cart.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = quantity;
    await item.save();

    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;