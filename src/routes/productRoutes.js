const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const authRole = require("../middleware/roleMiddleware");


router.get("/", productController.getProducts);

router.get("/:id", productController.getProduct);

router.post("/", authMiddleware.protect, authRole.authorize("admin"), productController.createProduct);

router.put("/:id", authMiddleware.protect, authRole.authorize("admin"), productController.updateProduct);

router.delete("/:id", authMiddleware.protect, authRole.authorize("admin"), productController.deleteProduct);


module.exports = router;