const express = require("express");
const router = express.Router();

const authController= require("../controllers/authController");
const uploadController = require("../controllers/uploadController");
const authMiddleware = require("../middleware/authMiddleware");
const authRole=require("../middleware/roleMiddleware")
const upload=require("../utils/upload")

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/upload",authMiddleware.protect,authRole.authorize("admin"),upload.single("profile"),uploadController.uploadProfilePic)

module.exports = router;