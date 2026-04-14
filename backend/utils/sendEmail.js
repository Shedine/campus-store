const nodemailer = require("nodemailer");

// Gmail SMTP transporter (FREE + works on Render)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// SEND OTP
const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Campus Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Verification Code",
            html: `
                <div style="font-family:Arial;padding:10px">
                    <h2>Campus Store OTP</h2>
                    <p>Your verification code is:</p>
                    <h1 style="color:green">${otp}</h1>
                    <p>Expires in 5 minutes</p>
                </div>
            `
        });

        console.log("✅ OTP sent to:", email);

    } catch (err) {
        console.error("❌ EMAIL ERROR:", err.message);

        // IMPORTANT: do NOT crash server
        return;
    }
};

module.exports = sendOTP;