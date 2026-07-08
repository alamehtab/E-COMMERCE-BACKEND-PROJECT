const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

exports.sendSMS = async (to, message) => {
    try {
        const sms = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });

        console.log("SMS Sent:", sms.sid);

        return sms;

    } catch (error) {
        console.error("SMS Error:", error.message);
        throw error;
    }
};