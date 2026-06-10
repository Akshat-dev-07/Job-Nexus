const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const adminController = require("../controllers/adminController");

// Dashboard
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  adminController.getDashboardStats
);

// Users
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  adminController.getAllUsers
);

router.patch(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.updateUserByAdmin
);

router.delete(
  "/users/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteUserByAdmin
);

// Jobs
router.get(
  "/jobs",
  authMiddleware,
  adminMiddleware,
  adminController.getAllJobsAdmin
);

router.patch(
  "/jobs/:id",
  authMiddleware,
  adminMiddleware,
  adminController.updateJobByAdmin
);

router.delete(
  "/jobs/:id",
  authMiddleware,
  adminMiddleware,
  adminController.deleteJobByAdmin
);

// Applications
router.get(
  "/applications",
  authMiddleware,
  adminMiddleware,
  adminController.getAllApplicationsAdmin
);

// Job Reports
router.get(
  "/reports",
  authMiddleware,
  adminMiddleware,
  adminController.getAllJobReportsAdmin
);

router.patch(
  "/reports/:id",
  authMiddleware,
  adminMiddleware,
  adminController.updateJobReportByAdmin
);

module.exports = router;