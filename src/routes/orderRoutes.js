const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const authRole = require("../middleware/roleMiddleware");

router.post("/", authMiddleware.protect, orderController.createOrder);

router.get("/my-orders", authMiddleware.protect, orderController.getMyOrders);

router.get("/:id", authMiddleware.protect, orderController.getOrderById);

router.put("/:id", authMiddleware.protect, authRole.authorize("admin"), orderController.updateOrderStatus);

module.exports = router;