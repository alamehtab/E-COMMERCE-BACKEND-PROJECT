const nodemailer = require("nodemailer")
exports.sendMail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS
            }
        })
        await transporter.sendMail({
            from: process.env.USER_EMAIL,
            to: email,
            subject,
            text
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}