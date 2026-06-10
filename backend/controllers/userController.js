const User = require("../models/User");
const Resume = require("../models/resume");
const Application = require("../models/Application");
const Job = require("../models/Job");
const bcrypt = require("bcryptjs");

/* ================= GET CURRENT USER PROFILE ================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};

/* ================= UPDATE CURRENT USER PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const { password } = updates;

    // Password is required for profile updates (security verification)
    if (!password) {
      return res.status(400).json({ message: "Password is required to update profile" });
    }

    // Get the current user with password field
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email; // Email changes might need verification
    delete updates.role; // Role changes should be admin only

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* ================= UPDATE SIGN-IN CREDENTIALS ================= */
exports.updateCredentials = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newEmail, newPassword } = req.body;

    if (!currentPassword) {
      return res
        .status(400)
        .json({ message: "Current password is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const updates = {};

    if (typeof newEmail === "string" && newEmail.trim()) {
      const normalizedEmail = newEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({ message: "Invalid email address" });
      }

      if (normalizedEmail !== (user.email || "").toLowerCase()) {
        const exists = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: userId },
        });

        if (exists) {
          return res.status(409).json({ message: "Email already in use" });
        }

        updates.email = normalizedEmail;
      }
    }

    if (typeof newPassword === "string" && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return res
          .status(400)
          .json({ message: "New password must be at least 6 characters" });
      }

      const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);
      updates.password = hashedPassword;
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No credential changes provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.json({
      message: "Credentials updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update credentials error:", err);

    if (err && err.code === 11000) {
      return res.status(409).json({ message: "Email already in use" });
    }

    return res.status(500).json({ message: "Failed to update credentials" });
  }
};

/* ================= DELETE ACCOUNT BY USER ================= */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;

    // Password is required for account deletion (security verification)
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    // Get the current user with password field
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin accounts cannot be deleted via this endpoint" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (user.role === "employer") {
      const jobs = await Job.find({ employerId: userId }).select("_id");
      const jobIds = jobs.map((j) => j._id);

      if (jobIds.length > 0) {
        await Application.deleteMany({ jobId: { $in: jobIds } });
        await Job.deleteMany({ _id: { $in: jobIds } });
      }

      await User.findByIdAndDelete(userId);
      return res.json({ message: "Employer account deleted" });
    }

    // Candidate cleanup
    await Resume.deleteMany({ userId });

    await Application.deleteMany({ applicantId: userId, status: "pending" });
    await Application.updateMany(
      { applicantId: userId },
      { $set: { candidateIsActive: false } }
    );

    await User.findByIdAndDelete(userId);
    return res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

/* ================= DELETE CURRENT USER ACCOUNT BY ADMIN ================= */
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.userId;

    // Delete all user's resumes first
    await Resume.deleteMany({ userId });

    // Delete all user's applications
    await Application.deleteMany({ applicantId: userId, status: "pending" });

    await Application.updateMany({ applicantId: userId }, { $set: { candidateIsActive: false } });

    // Delete the user account
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete profile error:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

/* ================= GET COMPANY DETAILS ================= */
exports.getCompany = async (req, res) => {
  try {
    const user = await User.findById(req.params.employerId).select("-password");

    if (!user || user.role !== "employer") {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Get company error:", err);
    res.status(500).json({ message: "Failed to load company details" });
  }
};

/* ================= GET ALL COMPANIES ================= */
exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: "employer" }).select("-password");
    res.json(companies);
  } catch (err) {
    console.error("Get all companies error:", err);
    res.status(500).json({ message: "Failed to load companies" });
  }
};

/* ================= GET USER BY ID ================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Get user by ID error:", err);
    res.status(500).json({ message: "Failed to load user" });
  }
};