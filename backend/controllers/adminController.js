const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const JobReport = require("../models/JobReport");

/* =========================
   DASHBOARD STATS
========================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      totalAdmins,
      totalJobs,
      activeJobs,
      pendingJobs,
      featuredJobs,
      totalApplications,
      suspendedUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "candidate" }),
      User.countDocuments({ role: "employer" }),
      User.countDocuments({ role: "admin" }),
      Job.countDocuments(),
      Job.countDocuments({ isActive: true }),
      Job.countDocuments({ approvalStatus: "pending" }),
      Job.countDocuments({ isFeatured: true }),
      Application.countDocuments(),
      User.countDocuments({ isSuspended: true })
    ]);

    const recentUsers = await User.find()
      .select("name email role createdAt isVerified isSuspended companyName")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentJobs = await Job.find()
      .populate("employerId", "name email companyName")
      .select("title company location approvalStatus isFeatured isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalCandidates,
        totalEmployers,
        totalAdmins,
        totalJobs,
        activeJobs,
        pendingJobs,
        featuredJobs,
        totalApplications,
        suspendedUsers
      },
      recentUsers,
      recentJobs
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({ message: "Failed to load admin dashboard" });
  }
};

/* =========================
   USERS
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, verified, suspended } = req.query;

    let query = {};

    if (role) query.role = role;

    if (verified === "true") query.isVerified = true;
    if (verified === "false") query.isVerified = false;

    if (suspended === "true") query.isSuspended = true;
    if (suspended === "false") query.isSuspended = false;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

exports.updateUserByAdmin = async (req, res) => {
  try {
    const { role, isVerified, isSuspended, companyName, name, phone, location } = req.body;

    const updateData = {};

    if (role && ["candidate", "employer", "admin"].includes(role)) {
      updateData.role = role;
    }

    if (typeof isVerified === "boolean") updateData.isVerified = isVerified;
    if (typeof isSuspended === "boolean") updateData.isSuspended = isSuspended;

    if (typeof companyName === "string") updateData.companyName = companyName;
    if (typeof name === "string") updateData.name = name;
    if (typeof phone === "string") updateData.phone = phone;
    if (typeof location === "string") updateData.location = location;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};

exports.deleteUserByAdmin = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);

    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting self optionally
    if (String(userToDelete._id) === String(req.userId)) {
      return res.status(400).json({ message: "You cannot delete your own admin account here" });
    }

    await User.findByIdAndDelete(req.params.id);

    // Optional cleanup:
    // If employer deleted, you may also archive their jobs
    if (userToDelete.role === "employer") {
      await Job.updateMany(
        { employerId: userToDelete._id },
        { $set: { isActive: false, isFlagged: true } }
      );
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

/* =========================
   JOBS
========================= */
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const { approvalStatus, featured, active, search } = req.query;

    let query = {};

    if (approvalStatus) query.approvalStatus = approvalStatus;
    if (featured === "true") query.isFeatured = true;
    if (featured === "false") query.isFeatured = false;
    if (active === "true") query.isActive = true;
    if (active === "false") query.isActive = false;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } }
      ];
    }

    const jobs = await Job.find(query)
      .populate("employerId", "name email companyName isVerified")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    console.error("Admin get jobs error:", error);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
};

exports.updateJobByAdmin = async (req, res) => {
  try {
    const {
      approvalStatus,
      isFeatured,
      isUrgent,
      isFlagged,
      isActive,
      rejectionReason
    } = req.body;

    const updateData = {};

    if (approvalStatus && ["pending", "approved", "rejected"].includes(approvalStatus)) {
      updateData.approvalStatus = approvalStatus;
    }

    if (typeof isFeatured === "boolean") updateData.isFeatured = isFeatured;
    if (typeof isUrgent === "boolean") updateData.isUrgent = isUrgent;
    if (typeof isFlagged === "boolean") updateData.isFlagged = isFlagged;

    // Keep legacy isActive and public-facing status aligned.
    // Public listing uses `status` + `approvalStatus`.
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
      updateData.status = isActive ? "active" : "closed";
    }
    if (typeof rejectionReason === "string") updateData.rejectionReason = rejectionReason;

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true
    }).populate("employerId", "name email companyName isVerified");

    if (!updatedJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({
      message: "Job updated successfully",
      job: updatedJob
    });
  } catch (error) {
    console.error("Admin update job error:", error);
    res.status(500).json({ message: "Failed to update job" });
  }
};

exports.deleteJobByAdmin = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Admin delete job error:", error);
    res.status(500).json({ message: "Failed to delete job" });
  }
};

/* =========================
   APPLICATIONS
========================= */
exports.getAllApplicationsAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    let query = {};
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate("jobId", "title company location")
      .populate("applicantId", "name email")
      .populate("resumeId", "title")
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    console.error("Admin get applications error:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

/* =========================
   JOB REPORTS
========================= */
exports.getAllJobReportsAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status && ["open", "reviewed", "resolved"].includes(status)) {
      query.status = status;
    }

    const reports = await JobReport.find(query)
      .populate(
        "jobId",
        "title company location employerId approvalStatus isFeatured isFlagged isActive status"
      )
      .populate("reporterId", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error("Admin get reports error:", error);
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

exports.updateJobReportByAdmin = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const updateData = {};

    if (typeof adminNote === "string") {
      updateData.adminNote = adminNote;
    }

    if (status && ["open", "reviewed", "resolved"].includes(status)) {
      updateData.status = status;

      if (status === "resolved") {
        updateData.resolvedAt = new Date();
        updateData.resolvedBy = req.userId;
      } else {
        updateData.resolvedAt = null;
        updateData.resolvedBy = null;
      }
    }

    const updated = await JobReport.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    })
      .populate(
        "jobId",
        "title company location employerId approvalStatus isFeatured isFlagged isActive status"
      )
      .populate("reporterId", "name email");

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    return res.json({ message: "Report updated", report: updated });
  } catch (error) {
    console.error("Admin update report error:", error);
    return res.status(500).json({ message: "Failed to update report" });
  }
};