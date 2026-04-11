const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },

    // ✅ NEW FIELDS
    isVerified: { type: Boolean, default: false },
    otp: String,
    otpExpires: Date,
    resetToken: String,
    resetExpires: Date
});

module.exports = mongoose.model("User", userSchema);
