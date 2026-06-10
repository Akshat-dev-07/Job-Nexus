const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const userController = require("../controllers/userController");
const adminController = require("../controllers/adminController");

// GET CURRENT USER (STANDARD REST ENDPOINT)
router.get("/me", auth, userController.getProfile);

// UPDATE CURRENT USER PROFILE
router.put("/me", auth, userController.updateProfile);

// GET USER PROFILE
router.get("/profile", auth, userController.getProfile);

// UPDATE USER PROFILE
router.put("/profile", auth, userController.updateProfile);

// DELETE ACCOUNT and all resumes
router.delete("/deleteAccount", auth, userController.deleteAccount);

// UPDATE SIGN-IN CREDENTIALS (email/password)
router.patch("/credentials", auth, userController.updateCredentials);

// GET COMPANY PROFILE
router.get("/company", auth, userController.getCompany);

// UPDATE COMPANY PROFILE
router.put("/company", auth, userController.updateProfile);

// GET ALL COMPANIES (PUBLIC)
router.get("/companies", userController.getAllCompanies);

// GET USER BY ID (PUBLIC)
router.get("/:id", userController.getUserById);

// GET ALL USERS (ADMIN ONLY)
router.get("/", auth, adminController.getAllUsers);

// DELETE USER (ADMIN ONLY)
router.delete("/:id", auth, adminController.deleteUserByAdmin);

module.exports = router;