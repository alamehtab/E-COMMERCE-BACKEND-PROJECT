const razorpay = require("../config/razorpay");
const Cart = require("../models/cart");
const Payment = require("../models/payment");
const crypto = require("crypto")
const Order = require("../models/order");

// create payment order
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

//verify payment of the user (without webhooks)
exports.verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

        // razorpay uses orderId and paymentId as a signature
        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(body.toString()).digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "invalid signature!" })
        }

        const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id })
        if (!payment) {
            return res.status(404).json({ message: "Payment not initiated yet!" })
        }

        payment.status = "verified"
        payment.razorpayPaymentId = razorpay_payment_id
        payment.razorpaySignature = razorpay_signature
        await payment.save()

        return res.status(200).json({ message: "Payment verified!" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
};

exports.razorpayWebhook = async (req, res) => {
    try {
        // razorpay send signature in header and raw json string in the body.
        const webhookSignature = req.headers["x-razorpay-signature"];

        // while using webhook razorpay signs the whole body. so we have to hash the whole body
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature !== webhookSignature) {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }

        const event = req.body.event;

        if (event === "payment.captured") {

            const paymentEntity = req.body.payload.payment.entity;

            const razorpayOrderId = paymentEntity.order_id;
            const razorpayPaymentId = paymentEntity.id;

            const payment = await Payment.findOne({
                razorpayOrderId,
            });

            // we are using 200 because if we use 400 razorpay will think that webhook failed and will retry again and again which may lead to webhook spam.
            if (!payment) {
                console.log("Payment record not found. Ignoring webhook.");
                return res.status(200).send("Payment not found");
            }

            if (payment.status === "success") {
                console.log("Webhook already processed.");
                return res.status(200).send("Already processed");
            }
            payment.status = "success";
            payment.razorpayPaymentId = razorpayPaymentId;
            payment.razorpaySignature = webhookSignature
            await payment.save();

            const cart = await Cart.findOne({ user: payment.user, }).populate("items.product");

            if (!cart || cart.items.length === 0) {
                return res.status(200).send("Cart empty");
            }

            let totalPrice = 0;

            const orderItems = cart.items.map((item) => {
                totalPrice += item.price * item.quantity;
                return {
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.price,
                };
            });

            const order = await Order.create({
                user: payment.user,
                items: orderItems,
                totalPrice,
                status: "placed",
            });

            payment.order = order._id;
            await payment.save();

            for (const item of cart.items) {
                await Product.findByIdAndUpdate(item.product._id, {
                    $inc: {
                        stock: -item.quantity,
                        sold: item.quantity,
                    },
                });
            }
            cart.items = [];
            cart.totalPrice = 0;
            await cart.save();
            return res.status(200).json({ success: true, received: true, message: "Payment verified and order placed!" });
        }
        if (event === "refund.processed") {
            const refundEntity = req.body.payload.refund.entity
            const refundId = refundEntity.id
            const paymentId = refundEntity.payment_id
            const payment = await Payment.findOne({ razorpayPaymentId: paymentId }).populate("order")
            if (!payment) {
                return res.status(200).json({ message: "No payment recorder found!" })
            }
            if (payment.status === "refunded") {
                return res.status(200).json({ message: "Already refunded!" })
            }
            payment.status = "refunded"
            payment.refundId = refundId
            await payment.save()
            const order = payment.order
            if (order && order.status !== "cancelled") {
                order.status = "cancelled"
                await order.save()
                for (let item of order.items) {
                    await Product.findByIdAndUpdate(item.product, {
                        $inc: {
                            stock: item.quantity,
                            sold: -item.quantity
                        }
                    })
                }
            }
            return res.status(200).json({ message: "Refund allowed!" })
        }
        return res.status(200).json({ message: "Event ignored!" })
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).json({ message: err.message });
    }
};