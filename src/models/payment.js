const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    amount: Number,
    paymentMethod: {
        type: String,
        enum: ["mock", "razorpay"],
        default: "mock"
    },
    status: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    },
    refundId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);