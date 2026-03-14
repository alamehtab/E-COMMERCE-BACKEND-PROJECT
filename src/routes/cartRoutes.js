const express = require("express");
const router = express.Router();

const cartController= require("../controllers/cartController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware.protect, cartController.addToCart);

router.get("/", authMiddleware.protect, cartController.getCart);

router.delete("/remove", authMiddleware.protect, cartController.removeFromCart);

module.exports = router;