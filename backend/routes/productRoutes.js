const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// Add product
router.post("/add", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product
router.post("/", async (req, res) => {
    try {
        const { name, price, image } = req.body;

        const product = new Product({
            name,
            price,
            image
        });

        await product.save();

        res.json({ message: "Product added" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
