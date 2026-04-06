const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const paymentController=require("../controllers/paymentController")

router.post("/create-payment", protect, paymentController.createPayment);

module.exports = router;