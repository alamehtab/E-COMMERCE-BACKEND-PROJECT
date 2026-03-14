const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");

const authMiddleware = require("../middleware/authMiddleware");
const authRole = require("../middleware/roleMiddleware");

router.post("/", authMiddleware.protect, authRole.authorize("admin"), categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategory);
router.put("/:id", authMiddleware.protect, authRole.authorize("admin"), categoryController.updateCategory);
router.delete("/:id", authMiddleware.protect, authRole.authorize("admin"), categoryController.deleteCategory);

module.exports = router;