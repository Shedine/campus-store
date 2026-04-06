const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/campus_store")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const productRoutes = require("./routes/productRoutes");

app.use("/api/products", productRoutes);

const orderRoutes = require("./routes/orderRoutes");
app.use("/api/orders", orderRoutes)

const cartRoutes = require("./routes/cartRoutes");
app.use("/api/cart", cartRoutes);

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const mpesaRoutes = require("./routes/mpesaRoutes");
app.use("/api/mpesa", mpesaRoutes);


// Test route
app.get("/", (req, res) => {
    res.send("Campus Store API Running");
});

// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
