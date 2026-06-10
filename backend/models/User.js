const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ── core auth / identity ─────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["candidate", "employer", "admin"],
      default: "candidate",
    },

    // ── candidate fields ─────────────────────────────────
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    headline: {
      type: String,
      default: "",
      trim: true,
    },

    experience: {
      type: String,
      enum: ["fresher", "1-3", "3-5", "5+"],
      default: "fresher",
    },

    bio: {
      type: String,
      default: "",
      trim: true,
    },

    preferredJobTypes: {
      type: [String],
      default: [],
    },

    preferredWorkModes: {
      type: [String],
      default: [],
    },

    preferredLocations: {
      type: String,
      default: "",
      trim: true,
    },

    // ── employer fields ──────────────────────────────────
    companyName: {
      type: String,
      default: "",
      trim: true,
    },

    companyWebsite: {
      type: String,
      default: "",
      trim: true,
    },

    industry: {
      type: String,
      default: "",
      trim: true,
    },

    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "200+"],
      default: "1-10",
    },

    companyCity: {
      type: String,
      default: "",
      trim: true,
    },

    companyDescription: {
      type: String,
      default: "",
      trim: true,
    },

    hiringFor: {
      type: [String],
      default: [],
    },

    // ── admin / trust / moderation ───────────────────────
    isVerified: {
      type: Boolean,
      default: false, // especially important for employers
    },

    isSuspended: {
      type: Boolean,
      default: false
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);