const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware")
const paymentController = require("../controllers/paymentController")

router.post("/create-payment", authMiddleware.protect, roleMiddleware.authorize("user"), paymentController.createPayment);
router.post("/verify-payment", authMiddleware.protect, roleMiddleware.authorize("user"), paymentController.verifyPayment)
router.post("/razorpay-webhook", paymentController.razorpayWebhook)

module.exports = router;