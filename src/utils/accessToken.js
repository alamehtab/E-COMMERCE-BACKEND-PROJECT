const jwt = require("jsonwebtoken");

const generateAccessToken = (userId, email, role) => {
    return jwt.sign(
        { id: userId, email: email, role: role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

};

module.exports = generateAccessToken;