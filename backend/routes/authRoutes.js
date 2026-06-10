const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Current user (protected)
router.get("/me", auth, authController.me);

// Logout (clears cookies)
router.post("/logout", authController.logout);

// Verify password (protected)
router.post("/verify-password", auth, authController.verifyPassword);

module.exports = router;
