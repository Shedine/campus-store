const express = require("express");
const router = express.Router();
const User = require("../models/User");

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = new User({ username, password });
        await user.save();

        res.json({ message: "User registered" });
    } catch (err) {
        res.status(500).json({ error: "User already exists" });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", userId: user.username });
});

module.exports = router;
