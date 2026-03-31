const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "placed", "paid", "shipped", "delivered", "cancelled"],
        default: "placed"
    },
    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String
    }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);