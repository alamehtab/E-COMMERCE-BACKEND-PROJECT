const Review = require("../models/review")
const Product = require("../models/product")

// CREATE REVIEW
exports.createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body
        const product = await Product.findById(req.params.productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        const review = await Review.create({
            user: req.user._id,
            product: req.params.productId,
            rating,
            comment
        })
        // update product rating
        const reviews = await Review.find({ product: req.params.productId })
        const avgRating =
            reviews.reduce((acc, item) => acc + item.rating, 0) /
            reviews.length
        product.ratings = avgRating
        product.numOfReviews = reviews.length
        await product.save()
        return res.status(201).json(review)
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                message: "You already reviewed this product"
            })
        }
        return res.status(500).json({ message: error.message })
    }
}
// GET PRODUCT REVIEWS
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({
            product: req.params.productId
        }).populate("user", "name")
        return res.json(reviews)
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}