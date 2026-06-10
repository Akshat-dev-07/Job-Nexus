const Job = require("../models/Job");

/* ---------------- HELPERS ---------------- */
function normalizeRequirements(input) {
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    return input
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeJob(jobDoc) {
  const job = jobDoc.toObject ? jobDoc.toObject() : { ...jobDoc };

  // Migration-safe fallback for old data
  if (typeof job.requirements === "string") {
    job.requirements = job.requirements
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (!Array.isArray(job.requirements)) {
    job.requirements = [];
  }

  // Fallbacks for old docs if they still exist in DB
  if (!job.workMode && typeof job.remote === "boolean") {
    job.workMode = job.remote ? "Remote" : "On-site";
  }

  if (!job.status && typeof job.isActive === "boolean") {
    job.status = job.isActive ? "active" : "closed";
  }

  if ((job.salaryMin == null || job.salaryMax == null) && job.salary != null) {
    job.salaryMin = job.salary;
    job.salaryMax = job.salary;
    if (!job.salaryPeriod) job.salaryPeriod = "monthly";
  }

  if (!Array.isArray(job.benefits)) {
    job.benefits = [];
  }

  if (!job.vacancies) {
    job.vacancies = 1;
  }

  // Admin migration-safe defaults for old docs
  if (!job.approvalStatus) {
    job.approvalStatus = "approved";
  }

  if (typeof job.isFeatured !== "boolean") {
    job.isFeatured = false;
  }

  if (typeof job.isUrgent !== "boolean") {
    job.isUrgent = false;
  }

  if (typeof job.isFlagged !== "boolean") {
    job.isFlagged = false;
  }

  if (typeof job.rejectionReason !== "string") {
    job.rejectionReason = "";
  }

  return job;
}

/* ---------------- POST JOB (EMPLOYER ONLY) ---------------- */
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      description,
      type,
      category,
      experience,
      workMode,
      salaryMin,
      salaryMax,
      salaryPeriod,
      vacancies,
      requirements,
      additionalRequirements,
      benefits,
      closingDate,
      status,
    } = req.body;

    // Basic validation
    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: "title, company, location, and description are required",
      });
    }

    const parsedRequirements = Array.isArray(requirements)
      ? requirements.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const parsedBenefits = Array.isArray(benefits)
      ? benefits.map((b) => String(b).trim()).filter(Boolean)
      : [];

    const parsedSalaryMin =
      salaryMin !== undefined && salaryMin !== null && salaryMin !== ""
        ? Number(salaryMin)
        : null;

    const parsedSalaryMax =
      salaryMax !== undefined && salaryMax !== null && salaryMax !== ""
        ? Number(salaryMax)
        : null;

    const parsedVacancies =
      vacancies !== undefined && vacancies !== null && vacancies !== ""
        ? Number(vacancies)
        : 1;

    if (
      parsedSalaryMin !== null &&
      parsedSalaryMax !== null &&
      parsedSalaryMin > parsedSalaryMax
    ) {
      return res.status(400).json({
        message: "salaryMin cannot be greater than salaryMax",
      });
    }

    if (parsedVacancies < 1) {
      return res.status(400).json({
        message: "vacancies must be at least 1",
      });
    }

    const job = new Job({
      title: String(title).trim(),
      company: String(company).trim(),
      location: String(location).trim(),
      description: String(description).trim(),

      type: type || "Full-Time",
      category: category || "",
      experience: experience || "",
      workMode: workMode || "On-site",

      salaryMin: parsedSalaryMin,
      salaryMax: parsedSalaryMax,
      salaryPeriod: salaryPeriod || "monthly",

      vacancies: parsedVacancies,

      requirements: parsedRequirements,
      additionalRequirements: additionalRequirements || "",
      benefits: parsedBenefits,

      closingDate: closingDate || null,
      status: status || "active",

      // Admin moderation fields
      approvalStatus: "approved", // change to "pending" if you want manual approval first
      isFeatured: false,
      isUrgent: false,
      isFlagged: false,
      rejectionReason: "",

      employerId: req.userId,
    });

    await job.save();

    res.status(201).json({
      message: "Job posted successfully",
      job: normalizeJob(job),
    });
  } catch (err) {
    console.error("createJob error:", err);
    res.status(500).json({
      message: "Failed to create job",
      error: err.message,
    });
  }
};

/* ---------------- GET ALL JOBS (PUBLIC) ---------------- */
exports.getAllJobs = async (req, res) => {
  try {
    const {
      title,
      location,
      minSalary,
      type,
      workMode,
      remote,
      status,
      category,
      experience,
      employerId,
      page,
      limit,
    } = req.query;

    let query = {
      approvalStatus: "approved",
    };

    if (employerId) {
      query.employerId = employerId;
    }

    if (title) {
      query.title = { $regex: title, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

  // Handle work mode filter (prioritize workMode, fall back to remote for backward compatibility)
    if (workMode) {
      query.workMode = workMode;
    } else if (remote === "true") {
      query.workMode = "Remote";
    }

    if (status) {
      query.status = status;
    } else {
      // Default public listing behavior
      query.status = "active";
    }

    if (category) {
      query.category = category;
    }

    if (experience) {
      query.experience = experience;
    }

    // New salary system
    if (minSalary) {
      query.$or = [
        { salaryMin: { $gte: Number(minSalary) } },
        { salaryMax: { $gte: Number(minSalary) } },
        // migration-safe fallback for old docs
        { salary: { $gte: Number(minSalary) } },
      ];
    }

    const hasPaginationParams = page !== undefined || limit !== undefined;

    const parsedLimitRaw = Number(limit);
    const parsedPageRaw = Number(page);
    const parsedLimit = Number.isFinite(parsedLimitRaw) && parsedLimitRaw > 0 ? parsedLimitRaw : 12;
    const safeLimit = Math.min(parsedLimit, 50);
    const parsedPage = Number.isFinite(parsedPageRaw) && parsedPageRaw > 0 ? parsedPageRaw : 1;

    if (!hasPaginationParams) {
      const jobs = await Job.find(query).sort({
        isFeatured: -1,
        createdAt: -1,
      });

      const normalizedJobs = jobs.map((job) => normalizeJob(job));
      return res.json(normalizedJobs);
    }

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
      .sort({
        isFeatured: -1,
        createdAt: -1,
      })
      .skip((parsedPage - 1) * safeLimit)
      .limit(safeLimit);

    const normalizedJobs = jobs.map((job) => normalizeJob(job));
    const hasMore = parsedPage * safeLimit < total;

    return res.json({
      jobs: normalizedJobs,
      total,
      page: parsedPage,
      limit: safeLimit,
      hasMore,
    });
  } catch (err) {
    console.error("getAllJobs error:", err);
    res.status(500).json({
      message: "Failed to fetch jobs",
      error: err.message,
    });
  }
};

/* ---------------- GET SINGLE JOB ---------------- */
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const normalized = normalizeJob(job);

    // Public should not see inactive / unapproved jobs
    if (normalized.status !== "active" || normalized.approvalStatus !== "approved") {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(normalized);
  } catch (err) {
    console.error("getJob error:", err);
    res.status(500).json({
      message: "Failed to fetch job",
      error: err.message,
    });
  }
};

/* ---------------- GET EMPLOYER'S JOBS ---------------- */
exports.getEmployerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ employerId: req.userId }).sort({
      createdAt: -1,
    });

    const normalizedJobs = jobs.map((job) => normalizeJob(job));

    res.json(normalizedJobs);
  } catch (err) {
    console.error("getEmployerJobs error:", err);
    res.status(500).json({
      message: "Failed to fetch employer jobs",
      error: err.message,
    });
  }
};

/* ---------------- GET SINGLE JOB DETAILS (FOR EMPLOYER) ---------------- */
exports.getJobDetailsForEmployer = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const normalized = normalizeJob(job);
    res.json(normalized);
  } catch (err) {
    console.error("getEmployerJob error:", err);
    res.status(500).json({
      message: "Failed to fetch job",
      error: err.message,
    });
  }
};

/* ---------------- UPDATE JOB (EMPLOYER OWNER ONLY) ---------------- */
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const {
      title,
      company,
      location,
      description,
      type,
      category,
      experience,
      workMode,
      salaryMin,
      salaryMax,
      salaryPeriod,
      vacancies,
      requirements,
      additionalRequirements,
      benefits,
      closingDate,
      status,
    } = req.body;

    // Update basic fields if provided
    if (title !== undefined) job.title = String(title).trim();
    if (company !== undefined) job.company = String(company).trim();
    if (location !== undefined) job.location = String(location).trim();
    if (description !== undefined) job.description = String(description).trim();
    if (type !== undefined) job.type = type;
    if (category !== undefined) job.category = category;
    if (experience !== undefined) job.experience = experience;
    if (workMode !== undefined) job.workMode = workMode;
    if (additionalRequirements !== undefined)
      job.additionalRequirements = additionalRequirements;

    // Update salary fields
    if (salaryMin !== undefined && salaryMin !== null && salaryMin !== "") {
      job.salaryMin = Number(salaryMin);
    } else if (salaryMin === null || salaryMin === "") {
      job.salaryMin = null;
    }

    if (salaryMax !== undefined && salaryMax !== null && salaryMax !== "") {
      job.salaryMax = Number(salaryMax);
    } else if (salaryMax === null || salaryMax === "") {
      job.salaryMax = null;
    }

    if (salaryPeriod !== undefined) job.salaryPeriod = salaryPeriod;

    // Validate salary
    if (
      job.salaryMin !== null &&
      job.salaryMax !== null &&
      job.salaryMin > job.salaryMax
    ) {
      return res.status(400).json({
        message: "salaryMin cannot be greater than salaryMax",
      });
    }

    // Update vacancies
    if (vacancies !== undefined && vacancies !== null && vacancies !== "") {
      const parsedVacancies = Number(vacancies);
      if (parsedVacancies < 1) {
        return res.status(400).json({
          message: "vacancies must be at least 1",
        });
      }
      job.vacancies = parsedVacancies;
    }

    // Update requirements (skills)
    if (requirements !== undefined) {
      const parsedRequirements = Array.isArray(requirements)
        ? requirements.map((s) => String(s).trim()).filter(Boolean)
        : [];
      job.requirements = parsedRequirements;
    }

    // Update benefits
    if (benefits !== undefined) {
      const parsedBenefits = Array.isArray(benefits)
        ? benefits.map((b) => String(b).trim()).filter(Boolean)
        : [];
      job.benefits = parsedBenefits;
    }

    // Update closing date
    if (closingDate !== undefined) {
      job.closingDate = closingDate || null;
    }

    // Update status
    if (status !== undefined) {
      job.status = status;
    }

    await job.save();

    res.json({
      message: "Job updated successfully",
      job: normalizeJob(job),
    });
  } catch (err) {
    console.error("updateJob error:", err);
    res.status(500).json({
      message: "Failed to update job",
      error: err.message,
    });
  }
};

/* ---------------- DELETE JOB (EMPLOYER OWNER ONLY) ---------------- */
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted" });
  } catch (err) {
    console.error("deleteJob error:", err);
    res.status(500).json({
      message: "Failed to delete job",
      error: err.message,
    });
  }
};
/* ---------------- CLOSE JOB (EMPLOYER OWNER ONLY) ---------------- */
exports.closeJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "closed";
    await job.save();
    res.json({ message: "Job closed" });
  } catch (err) {
    console.error("closeJob error:", err);
    res.status(500).json({
      message: "Failed to close job",
      error: err.message,
    });
  }
};
/* ---------------- REOPEN JOB (EMPLOYER OWNER ONLY) ---------------- */
exports.reopenJob = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      employerId: req.userId,
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    job.status = "active";
    await job.save();
    res.json({ message: "Job reopened" });
  } catch (err) {
    console.error("reopenJob error:", err);
    res.status(500).json({
      message: "Failed to reopen job",
      error: err.message,
    });
  }
};