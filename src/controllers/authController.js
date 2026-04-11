const User = require("../models/user");
const generateAccessToken = require("../utils/accessToken");
const { sendMail } = require("../utils/mail");
const generateRefreshToken = require("../utils/refreshToken");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });
        const accessToken = await generateAccessToken(user._id, user.email, user.role)
        const refreshToken = await generateRefreshToken(user._id)
        user.refreshToken = refreshToken
        await user.save()
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            accessToken: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const accessToken = await generateAccessToken(user._id, user.email, user.role)
        const refreshToken = await generateRefreshToken(user._id)
        user.refreshToken = refreshToken
        await user.save()
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict"
        })
        return res.status(200).json({
            success: true,
            message: "Login Successful",
            accessToken: accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(401).json({ message: "User not found!" })
        }
        const otp = Math.floor(100000 + Math.random() * 900000)
        const hashedOtp = bcrypt.hash(otp, 10)
        user.resetOtp = hashedOtp
        user.resetOtpExpiry = Date.now() + 5 * 60 * 1000
        await user.save()
        await sendMail(user.email, "Otp to reset your password", `Your Otp to reset your password is ${otp}. It will be valid for 5 minutes.`)
        return res.status(200).json({ message: "Otp sent to your registered email." })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body
        const user = await User.findOne({ email: email, resetOtpExpiry: { $gte: Date.now() } })
        if (!user) {
            return res.status(401).json({ message: "Otp expired or Invalid!" })
        }
        const isMatchOtp = bcrypt.compare(otp, user.resetOtp)
        if (!isMatchOtp) {
            return res.status(401).json({ message: "Invalid Otp!" })
        }
        const hashedPassword = bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        user.resetOtp = undefined
        user.resetOtpExpiry = undefined
        await user.save()
        return res.status(200).json({ message: "Your password was changed!" })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

exports.refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) {
            return res.status(401).json({ message: "No token provided!" })
        }
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.id)
        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: "Invalid token!" })
        }
        const newAccessToken = jwt.sign({ email: user.email, role: user.role, id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })
        return res.status(200).json({ newAccessToken })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}