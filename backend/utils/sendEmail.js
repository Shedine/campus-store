const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOTP = async (email, otp) => {
    try {
        await resend.emails.send({
            from: "Campus Store <onboarding@resend.dev>",
            to: email,
            subject: "Your OTP Code",
            html: `
                <h2>Campus Store Verification</h2>
                <p>Your OTP is:</p>
                <h1>${otp}</h1>
                <p>Expires in 5 minutes</p>
            `
        });

        console.log("OTP sent to:", email);

    } catch (err) {
        console.error("EMAIL ERROR:", err);
        throw new Error("Email sending failed");
    }
};

module.exports = sendOTP;