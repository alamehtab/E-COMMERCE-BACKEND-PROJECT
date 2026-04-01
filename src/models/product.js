const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        stock: {
            type: Number,
            required: true,
            default: 0
        },
        sold: {
            type: Number,
            default: 0
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        images: [String],
        ratings: {
            type: Number,
            default: 0
        },
        numOfReviews: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);