const nodemailer = require("nodemailer");

// ✅ Gmail transporter (Render-safe config)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
family: 4, // ✅ FORCE IPv4 (FIXES YOUR ERROR)
    port: 587, // ✅ IMPORTANT: 587 works on Render
    secure: false, // must be false for port 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ OTP email sender
const sendOTP = async (email, otp) => {
    try {
        await transporter.sendMail({
            from: `"Campus Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color:#FF6F00;">Campus Store Verification</h2>
                    <p>Use the OTP below to verify your account:</p>

                    <div style="
                        font-size: 28px;
                        font-weight: bold;
                        margin: 20px 0;
                        padding: 10px;
                        background: #f4f4f4;
                        display: inline-block;
                        border-radius: 5px;
                    ">
                        ${otp}
                    </div>

                    <p>This code expires in <b>5 minutes</b>.</p>

                    <hr>
                    <p style="font-size: 12px; color: gray;">
                        If you did not request this, ignore this email.
                    </p>
                </div>
            `
        });

        console.log("✅ OTP email sent to:", email);

    } catch (err) {
        // 🚨 IMPORTANT: never crash server if email fails
        console.error("❌ EMAIL SEND FAILED:", err.message);
    }
};

module.exports = sendOTP;