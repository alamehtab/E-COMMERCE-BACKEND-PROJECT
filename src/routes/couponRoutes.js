const express = require("express")
const router = express.Router()

const couponController = require("../controllers/couponController")

const authMiddleware = require("../middleware/authMiddleware")
const authRole = require("../middleware/roleMiddleware")


router.post("/", authMiddleware.protect, authRole.authorize("admin"), couponController.createCoupon)

router.post("/apply", authMiddleware.protect, couponController.applyCoupon)

module.exports = router