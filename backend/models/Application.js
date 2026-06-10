const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    candidateEmail: {
      type: String,
      required: true,
      trim: true,
    },

    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    candidateIsActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },

    // Useful for drawer UI / employer workflow
    isViewed: {
      type: Boolean,
      default: false,
    },

    viewedAt: {
      type: Date,
      default: null,
    },

    // Optional notes from employer/recruiter
    employerNotes: {
      type: String,
      default: "",
      trim: true,
    },

    // Useful for analytics / UI badges
    reviewedAt: {
      type: Date,
      default: null,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    // Optional history (very useful later)
    statusHistory: [
      {
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Automatically maintain timestamps/history when status changes
applicationSchema.pre("save", function () {
  if (this.isModified("status")) {
    const now = new Date();

    if (!this.reviewedAt && this.status !== "pending") {
      this.reviewedAt = now;
    }

    if (this.status === "accepted" && !this.acceptedAt) {
      this.acceptedAt = now;
    }

    if (this.status === "rejected" && !this.rejectedAt) {
      this.rejectedAt = now;
    }

    this.statusHistory.push({
      status: this.status,
      changedAt: now,
    });
  }
});

module.exports = mongoose.model("Application", applicationSchema);