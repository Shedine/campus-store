const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "hackler12600@gmail.com",
        pass: "yecouuggthnqjjrx"
    }
});

async function sendOTP(email, otp) {
    await transporter.sendMail({
        from: "Campus Store",
        to: email,
        subject: "Verify your account",
        html: `
<div style="font-family:sans-serif">
  <h2>Campus Store Verification</h2>
  <p>Your OTP code is:</p>
  <h1 style="letter-spacing:3px">${otp}</h1>
  <p>This code expires in 5 minutes.</p>
  <p>If you didn’t request this, ignore this email.</p>
</div>
`
    });
}

module.exports = sendOTP;