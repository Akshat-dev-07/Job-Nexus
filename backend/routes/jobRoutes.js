const employerOnly = require("../middleware/employerOnly");
const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const jobController = require("../controllers/jobController");
const Job = require("../models/Job");
const JobReport = require("../models/JobReport");
const User = require("../models/User");

/* employer only */
router.post("/", auth, employerOnly, jobController.createJob);
router.patch("/:id", auth, employerOnly, jobController.updateJob);

/* candidate: report a job */
router.post("/:id/report", auth, async (req, res) => {
	try {
		if (req.userRole !== "candidate") {
			return res.status(403).json({ message: "Candidates only" });
		}

		const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
		if (!reason) {
			return res.status(400).json({ message: "Please provide a reason" });
		}
		if (reason.length > 2000) {
			return res.status(400).json({ message: "Reason is too long (max 2000 characters)" });
		}

		const job = await Job.findById(req.params.id).select("_id");
		if (!job) {
			return res.status(404).json({ message: "Job not found" });
		}

		const existing = await JobReport.findOne({
			jobId: req.params.id,
			reporterId: req.userId,
			status: { $in: ["open", "reviewed"] },
		}).select("_id status createdAt");

		if (existing) {
			return res.status(400).json({
				message: "You already reported this job. Admin will review it.",
			});
		}

		const report = new JobReport({
			jobId: req.params.id,
			reporterId: req.userId,
			reporterName: "",
			reporterEmail: "",
			reason,
		});

		const reporter = await User.findById(req.userId).select("name email");
		if (reporter) {
			report.reporterName = reporter.name || "";
			report.reporterEmail = reporter.email || "";
		}

		await report.save();

		return res.json({ message: "Report submitted. Thank you for helping keep the platform safe." });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Failed to submit report" });
	}
});

/* public */
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJob);

/* employer owner */
router.delete("/:id", auth, employerOnly, jobController.deleteJob);

router.post("/:id/close", auth, employerOnly, jobController.closeJob);
router.post("/:id/reopen", auth, employerOnly, jobController.reopenJob);

router.get("/employer/:employerId", auth, employerOnly, jobController.getEmployerJobs);
router.get("/employer/:employerId/job/:id", auth, employerOnly, jobController.getJobDetailsForEmployer);

module.exports = router;