require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const userRoutes = require("./routes/userRoutes");
const userController = require("./controllers/userController");

const app = express();

// Needed for secure cookies behind proxies (Vercel/Render/etc.)
app.set("trust proxy", 1);

const normalizeOrigin = (origin) => origin.replace(/\/+$/, "");

const configuredOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const defaultProdOrigins = ["https://job-portal-resume-builder.vercel.app"];

const allowedOrigins = Array.from(
  new Set([
    ...configuredOrigins,
    ...(process.env.NODE_ENV === "production" ? defaultProdOrigins : []),
  ])
);

const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === "true";

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalized)) return true;

  if (
    allowVercelPreviews &&
    /^https:\/\/job-portal-resume-builder-.*\.vercel\.app$/.test(normalized)
  ) {
    return true;
  }

  return false;
}

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser requests (no Origin header)
    if (!origin) return callback(null, true);

    // Dev: allow any origin (reflected), so cookies work with credentials: true
    if (process.env.NODE_ENV !== "production") return callback(null, true);

    // Prod: explicit allowlist only
    return callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.use(cookieParser());
app.use(express.json());

connectDB().catch(() => {
  // If DB connection fails, exit so the app doesn't run half-alive.
  process.exit(1);
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 5000;

/* ================= JOB & APPLICATION ROUTES ================= */
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/resumes", resumeRoutes); // Alias for plural endpoint
app.use("/api/users", userRoutes);
app.get("/api/companies/:employerId", userController.getCompany);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
