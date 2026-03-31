const Coupon = require("../models/coupon")

// CREATE COUPON
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body)
        return res.status(201).json(coupon)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}
// APPLY COUPON
exports.applyCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body
        const coupon = await Coupon.findOne({
            code: code.toUpperCase(),
            isActive: true
        })
        if (!coupon) {
            return res.status(400).json({
                message: "Invalid coupon"
            })
        }
        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({
                message: "Coupon expired"
            })
        }
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                message: "Coupon inapplicable due to amount!"
            })
        }
        let discount = 0
        if (coupon.discountType === "percentage") {
            discount = (orderAmount * coupon.discountValue) / 100
        } else {
            discount = coupon.discountValue
        }
        return res.json({
            discount,
            finalAmount: orderAmount - discount
        })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}