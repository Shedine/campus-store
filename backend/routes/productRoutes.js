const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, isAdmin } = require("../middleware/auth");

// ADD PRODUCT
router.post("/", auth, isAdmin, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET PRODUCTS
router.get("/", async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

// DELETE
router.delete("/:id", auth, isAdmin, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

// UPDATE
router.put("/:id", auth, isAdmin, async (req, res) => {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, product: updated });
});

module.exports = router;