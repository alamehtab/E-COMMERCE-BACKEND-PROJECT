const express = require("express")
const router = express.Router()

const wishlistController = require("../controllers/wishlistController")

const authMiddleware = require("../middleware/authMiddleware")


router.post("/", authMiddleware.protect, wishlistController.addToWishlist)

router.get("/", authMiddleware.protect, wishlistController.getWishlist)

router.delete("/:productId", authMiddleware.protect, wishlistController.removeFromWishlist)

module.exports = router