const razorpay = require("../config/razorpay");
const Cart = require("../models/cart");
const payment = require("../models/payment");
const Payment = require("../models/payment");
const crypto = require("crypto")

exports.createPayment = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart empty"
            });
        }
        let totalPrice = 0
        const amount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
        totalPrice = amount * 100 // razorpay measure amount in paise
        const options = {
            amount: totalPrice,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }
        const paymentOrder = await razorpay.orders.create(options)
        const payment = await Payment.create({
            user: req.user._id,
            amount: totalPrice,
            paymentMethod: "razorpay",
            status: "pending",
            razorpayOrderId: paymentOrder.id
        })
        res.status(200).json({
            success: true,
            orderId: paymentOrder.id,
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            key: process.env.RAZORPAY_API_KEY
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product")
        if (!cart || cart.items.length == 0) {
            return res.status(401).json({ message: "Cart is empty!" })
        }
        let totalPrice = 0
        const amount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0)
        totalPrice = amount * 100
        const options = {
            amount: totalPrice,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }
        const paymentOrder = await razorpay.orders.create(options)
        const payment = await Payment.create({
            user: req.user._id,
            amount: totalPrice,
            status: "pending",
            paymentMethod: "razorpay",
            razorpayOrderId: paymentOrder.id
        })
        return res.status(200).json({ success: true, message: "Payment initiated!", amount: paymentOrder.amount, currency: paymentOrder.currency, orderId: paymentOrder.id, key: process.env.RAZORPAY_API_KEY })
    } catch (error) {

    }
}

exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(body.toString()).digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "invalid signature!" })
        }

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id })
        if (!payment) {
            return res.status(404).json({ message: "Payment not initiated yet!" })
        }

        payment.status = "success"
        payment.transactionId = razorpay_payment_id
        payment.razorpaySignature = razorpay_signature
        await payment.save()

        const cart = await Cart.findOne({ user: payment.user }).populate("items.product")
        let totalPrice = 0
        const orderItems = cart.items.map((item) => {
            totalPrice += item.price * item.quantity
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.price
            }
        })
        const order = await Order.create({
            user: payment.user,
            items: orderItems,
            totalPrice,
            status: "placed"
        });

        payment.order = order._id;
        await payment.save();

        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: {
                    stock: -item.quantity,
                    sold: item.quantity
                }
            });
        }

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(200).json({ message: "Payment verified and order created!", order })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
};