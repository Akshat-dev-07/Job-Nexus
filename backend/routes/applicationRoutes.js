const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Application = require("../models/Application");
const Job = require("../models/Job");
const Resume = require("../models/resume");


// ================= APPLY JOB =================
router.post("/", auth, async (req, res) => {
  try {
    if (req.userRole !== "candidate") {
      return res.status(403).json({ message: "Candidates only" });
    }

    const { jobId, resumeId } = req.body;

    // prevent duplicate apply
    const already = await Application.findOne({
      jobId,
      applicantId: req.userId,
      resumeId,
    });

    if (already)
      return res.status(400).json({ message: "Already applied with this resume" });

    const application = new Application({
      jobId,
      applicantId: req.userId,
      resumeId,
      candidateEmail: req.body.applicantEmail,
      candidateName: req.body.applicantName
    });

    await application.save();
    res.json({ message: "Application submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Apply failed" });
  }
});


// ================= MY APPLICATIONS =================
// GET candidate applications
router.get("/my", auth, async (req, res) => {
  try {
    if (req.userRole !== "candidate") {
      return res.status(403).json({ message: "Candidates only" });
    }

    const applications = await Application.find({
      applicantId: req.userId,
    })
      .populate("jobId")    
      .populate("resumeId") 
      .populate("status") 
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load applications" });
  }
});

// ================= EMPLOYER: MY JOBS =================
// uses a more specific path to avoid colliding with the applicants endpoint
router.get("/employer/:employerId/jobs", auth, async (req, res) => {
  try {
    if (req.userRole !== "employer") {
      return res.status(403).json({ message: "Employers only" });
    }

    const jobs = await Job.find({ employerId: req.params.employerId })
      .sort({ createdAt: -1 })
      .populate("employerId", "name");
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load jobs" });
  }
});

// ================= EMPLOYER: VIEW APPLICANTS =================
// moved to a sub‑route to make the intention clear and avoid the
// earlier /job/:employerId route capturing requests accidentally
router.get("/job/:jobId/applicants", auth, async (req, res) => {
  try {
    const apps = await Application.find({ jobId: req.params.jobId })
      .populate("applicantId", " name email")
      .populate("resumeId");

    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch applicants" });
  }
});
router.get("/job/:jobId", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job details" });
  }
});

// ================= EMPLOYER: VIEW APPLICANT RESUME =================
// Employer can view a resume only if the applicant applied to one of their jobs
router.get("/resume/:resumeId", auth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Case 1: requester is the resume owner (candidate viewing own resume)
    if (resume.userId.toString() === req.userId.toString()) {
      return res.json(resume);
    }

    // Case 2: requester is an employer — verify they own a job this resume was used to apply to
    if (req.userRole === "employer") {
      // Find an application that used this resume AND belongs to one of this employer's jobs
      const employerJobIds = await Job.find({ employerId: req.userId }).select("_id");
      const application = await Application.findOne({
        resumeId: req.params.resumeId,
        jobId: { $in: employerJobIds.map((j) => j._id) },
      })
        .sort({ createdAt: -1 })
        .populate("jobId", "title company location type workMode")
        .populate("applicantId", "name email");

      if (application) {
        const resumeObj = resume.toObject();

        return res.json({
          ...resumeObj,
          context: {
            application: {
              id: application._id,
              status: application.status,
              createdAt: application.createdAt,
              reviewedAt: application.reviewedAt,
              employerNotes: application.employerNotes,
            },
            candidate: {
              id: application.applicantId?._id || application.applicantId,
              name:
                application.applicantId?.name || application.candidateName || "Unknown Applicant",
              email:
                application.applicantId?.email || application.candidateEmail || "",
              isActive: application.candidateIsActive,
            },
            job: application.jobId
              ? {
                  id: application.jobId._id,
                  title: application.jobId.title,
                  company: application.jobId.company,
                  location: application.jobId.location,
                  type: application.jobId.type,
                  workMode: application.jobId.workMode,
                }
              : null,
          },
        });
      }
    }

    // Otherwise: forbidden
    return res.status(403).json({ message: "Access denied" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch resume" });
  }
});

// ================= UPDATE STATUS =================
router.patch("/:applicationId/status", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const app = await Application.findByIdAndUpdate(
      req.params.applicationId,
      { status },
      { new: true }
    );

    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Status update failed" });
  }
});

module.exports = router;