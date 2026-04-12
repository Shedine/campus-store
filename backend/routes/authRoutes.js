const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOTP = require("../utils/sendEmail");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
  return res.json({ success: false, message: "All fields required" });
}

// ✅ EMAIL FORMAT CHECK
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.json({ success: false, message: "Invalid email format" });
}

if (password.length < 6) {
  return res.json({ success: false, message: "Password must be at least 6 characters" });
}

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (!existingUser.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        existingUser.otp = otp;
        existingUser.otpExpires = Date.now() + 5 * 60 * 1000;

        await existingUser.save();
        console.log("OTP for", email, "is:", otp); // ✅ TEMP DEBUG

        return res.json({
          success: true,
          message: "OTP resent. Verify your account"
        });
      }

      return res.json({ success: false, message: "Email exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000
    });

    await user.save();
    console.log("RESEND OTP for", email, "is:", otp);

    res.json({ success: true, message: "OTP sent" });

  } catch (err) {
  console.error("LOGIN ERROR:", err);
  res.json({ success: false, message: "Server error" });
}
});

// LOGIN (JWT)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      user.otp = otp;
      user.otpExpires = Date.now() + 5 * 60 * 1000;

      await user.save();
      console.log("LOGIN OTP for", user.email, "is:", otp);

      return res.json({
        success: false,
        requireOTP: true,
        message: "Verify your account",
        email: user.email
      });
    }

    // 🔐 JWT TOKEN
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      userId: user._id,
      role: user.role
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({ success: false, message: err.message });
}
});

// VERIFY OTP
router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("VERIFY INPUT:", email, otp); // 🔥 debug

    if (!email || !otp) {
      return res.json({ success: false, message: "Missing fields" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "No user found" });
    }

    // 🔥 safer comparison
    if (String(user.otp) !== String(otp)) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (!user.otpExpires || Date.now() > user.otpExpires) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    return res.json({ success: true, message: "Verified successfully" });

  } catch (err) {
    console.error("VERIFY ERROR:", err); // 🔥 IMPORTANT
    return res.json({ success: false, message: "Server error" });
  }
});

module.exports = router;