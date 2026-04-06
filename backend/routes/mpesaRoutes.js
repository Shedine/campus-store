const express = require("express");
const router = express.Router();
const axios = require("axios");

// Replace with your credentials
const consumerKey = "6YVyu93lOCr1jETmWoAD2byoWgQlCjgWInFumGmJsuv88D72";
const consumerSecret = "IoKOl2G75OPqIxTSwCZ9GBHUriG4kdTB9QDqFjXxhpihgF61P9ZhmuqMMU0LMAv3";

const shortcode = "174379";
const passkey = "";

function getTimestamp() {
    const date = new Date();
    return date.getFullYear() +
        ("0" + (date.getMonth()+1)).slice(-2) +
        ("0" + date.getDate()).slice(-2) +
        ("0" + date.getHours()).slice(-2) +
        ("0" + date.getMinutes()).slice(-2) +
        ("0" + date.getSeconds()).slice(-2);
}

// Get Access Token
async function getAccessToken() {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { headers: { Authorization: `Basic ${auth}` } }
    );

    return response.data.access_token;
}

// STK Push
router.post("/pay", async (req, res) => {
    try {
        const { phone, amount } = req.body;

        const token = await getAccessToken();
        const timestamp = getTimestamp();
        const password = Buffer.from(shortcode + passkey + timestamp).toString("base64");

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            {
                BusinessShortCode: shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline",
                Amount: amount,
                PartyA: phone,
                PartyB: shortcode,
                PhoneNumber: phone,
                CallBackURL: "https://yourdomain.com/callback",
                AccountReference: "CampusStore",
                TransactionDesc: "Payment"
            },
            {
                headers: { Authorization: `Bearer ${token}` }
            }
        );

        res.json(response.data);

    } catch (err) {
        console.log(err.response?.data || err.message);
        res.status(500).json({ error: "Payment failed" });
    }
});

module.exports = router;
