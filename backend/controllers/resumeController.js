const Resume = require("../models/resume");
const User = require("../models/User");

/* ================= CREATE OR UPDATE RESUME ================= */
exports.saveResume = async (req, res) => {
  try {
    const { resumeId, title, data } = req.body;

    // UPDATE existing resume
    if (resumeId) {
      const updated = await Resume.findOneAndUpdate(
        { _id: resumeId, userId: req.userId },
        { title, data },
        { new: true },
      );

      if (!updated) {
        return res.status(404).json({ message: "Resume not found" });
      }

      return res.json(updated);
    }

    // CREATE new resume
    const resume = new Resume({
      userId: req.userId,
      title: title || "Untitled Resume",
      data,
    });

    await resume.save();
    res.json(resume);
  } catch (err) {
    console.error("Save resume error:", err);
    res.status(500).json({ message: "Save failed" });
  }
};

/* ================= GET ALL RESUMES ================= */
exports.getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(resumes);
  } catch (err) {
    console.error("Get resumes error:", err);
    res.status(500).json({ message: "Failed to load resumes" });
  }
};

/* ================= GET SINGLE RESUME ================= */
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("Get resume error:", err);
    res.status(500).json({ message: "Failed to load resume" });
  }
};

/* ================= RENAME RESUME ================= */
exports.renameResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title: req.body.title },
      { new: true },
    );

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (err) {
    console.error("Rename resume error:", err);
    res.status(500).json({ message: "Rename failed" });
  }
};

/* ================= DELETE RESUME ================= */
exports.deleteResume = async (req, res) => {
  try {
    const deleted = await Resume.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json({ message: "Resume deleted" });
  } catch (err) {
    console.error("Delete resume error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};


