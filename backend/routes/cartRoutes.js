const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// Add product to cart
router.post("/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const product = await Product.findById(productId);
if (!product) return res.status(404).json({ error: "Product not found" });

if (quantity > product.stock) {
  return res.status(400).json({ success: false, error: "Not enough stock" });
}
    let item = await Cart.findOne({ userId, productId });
    if (item) {
      if (item.quantity + quantity > product.stock) {
  return res.status(400).json({ success: false, error: "Exceeds stock" });
}
item.quantity += quantity;
      await item.save();
    } else {
      item = new Cart({ userId, productId, quantity });
      await item.save();
    }

    res.json({ success: true, message: "Added to cart", cartItem: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get cart items
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
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quantity
// UPDATE QUANTITY
router.put("/update/:id", async (req, res) => {
  try {
    const { quantity } = req.body;

    const item = await Cart.findById(req.params.id);
    if (!item) return res.json({ success: false });

    item.quantity = quantity;
    await item.save();

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;