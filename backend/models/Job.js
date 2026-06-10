const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    company: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      trim: true
    },

    requirements: {
      type: [String], // Changed to array for skills
      default: []
    },

    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // Additional fields for job posting
    category: {
      type: String,
      default: "",
      trim: true
    },

    experience: {
      type: String,
      default: "",
      trim: true
    },

    workMode: {
      type: String,
      enum: ["On-site", "Remote", "Hybrid"],
      default: "On-site"
    },

    salaryMin: {
      type: Number,
      default: null
    },

    salaryMax: {
      type: Number,
      default: null
    },

    salaryPeriod: {
      type: String,
      enum: ["monthly", "yearly", "project"],
      default: "monthly"
    },

    vacancies: {
      type: Number,
      default: 1,
      min: 1
    },

    additionalRequirements: {
      type: String,
      default: "",
      trim: true
    },

    benefits: {
      type: [String],
      default: []
    },

    closingDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["active", "paused", "closed"],
      default: "active"
    },

    type: {
      type: String,
      enum: ["Full-Time", "Part-Time", "Internship", "Contract"],
      default: "Full-Time"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // Admin controls
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved" // change to "pending" if you want manual moderation first
    },

    isFeatured: {
      type: Boolean,
      default: false
    },

    isUrgent: {
      type: Boolean,
      default: false
    },

    isFlagged: {
      type: Boolean,
      default: false
    },

    rejectionReason: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);