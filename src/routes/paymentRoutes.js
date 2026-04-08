const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const paymentController=require("../controllers/paymentController")

router.post("/create-payment", protect, paymentController.createPayment);
router.post("/verify-payment",protect,paymentController.verifyPayment)
router.post("/razorpay-webhook",paymentController.razorpayWebhook)

module.exports = router;