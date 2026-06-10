const Application = require("../models/Application");

/* APPLY TO JOB */
exports.applyJob = async (req, res) => {
  try {
    const { jobId, resumeId, applicantEmail, applicantName } = req.body;

    const existing = await Application.findOne({
      jobId,
      candidateId: req.userId
    });

    if (existing)
      return res.status(400).json({ message: "Already applied" });

    const application = new Application({
      jobId,
      resumeId,
      candidateId: req.userId,
      candidateEmail: applicantEmail,
      candidateName: applicantName
    });

    await application.save();

    res.json({ message: "Applied successfully" });
  } catch (err) {
    res.status(500).json({ message: "Application failed" });
  }
};

/* EMPLOYER: VIEW APPLICANTS */
exports.getApplicants = async (req, res) => {
  const applications = await Application.find({ jobId: req.params.jobId })
    .populate("candidateId", "name email")
    .populate("resumeId");

  res.json(applications);
};