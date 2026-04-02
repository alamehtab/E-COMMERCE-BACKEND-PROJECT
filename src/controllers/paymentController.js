const Cart = require("../models/cart");
const Payment = require("../models/payment");

exports.createPayment = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart empty"
            });
        }
        const amount = cart.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
        const payment = await Payment.create({
            user: req.user._id,
            amount,
            status: "pending"
        });
        res.json({
            message: "Payment initiated",
            paymentId: payment._id,
            amount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const { paymentId } = req.body;
        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not initiated!" });
        }
        // mark payment success
        payment.status = "success";
        payment.transactionId =
            "TXN_" + Date.now() + "-" + Math.round(Math.random() * 1e9);
        await payment.save();
        // get cart
        const cart = await Cart.findOne({ user: payment.user }).populate("items.product");

        // create order AFTER payment
        let totalPrice = 0;
        const orderItems = cart.items.map(item => {
            totalPrice += item.product.price * item.quantity;
            return {
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            };
        });
        const order = await Order.create({
            user: payment.user,
            items: orderItems,
            totalPrice,
            status: "placed"
        });
        payment.order = order._id;
        await payment.save();

        // reduce stock
        for (let item of cart.items) {
            await Product.findOneAndUpdate(
                { _id: item.product._id },
                {
                    $inc: {
                        stock: -item.quantity,
                        sold: item.quantity
                    }
                }
            );
        }
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
        res.json({ message: "Payment successful", order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};