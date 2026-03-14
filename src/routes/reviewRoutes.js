const express = require("express")
const router = express.Router()

const reviewController = require("../controllers/reviewController")

const authMiddleware = require("../middleware/authMiddleware")

router.post("/:productId", authMiddleware.protect, reviewController.createReview)

router.get("/:productId", reviewController.getProductReviews)

module.exports = router