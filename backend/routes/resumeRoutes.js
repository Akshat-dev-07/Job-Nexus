const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const resumeController = require("../controllers/resumeController");

// CREATE or UPDATE resume
router.post("/", auth, resumeController.saveResume);

// GET ALL resumes
router.get("/", auth, resumeController.getResumes);

// GET ONE resume (FULL OBJECT)
router.get("/:id", auth, resumeController.getResume);

// RENAME resume
router.patch("/:id", auth, resumeController.renameResume);

// DELETE resume
router.delete("/:id", auth, resumeController.deleteResume);


module.exports = router;
