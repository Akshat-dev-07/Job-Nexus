const mongoose = require("mongoose");

const jobReportSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reporterName: {
      type: String,
      default: "",
      trim: true,
    },

    reporterEmail: {
      type: String,
      default: "",
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ["open", "reviewed", "resolved"],
      default: "open",
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobReport", jobReportSchema);
