const express = require("express");
const router = express.Router();

const authController= require("../controllers/authController");
const { upload } = require("../utils/uploadMulter");

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router;