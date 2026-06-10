import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import {
  LuInfo,
  LuPlus,
  LuX,
  LuSparkles,
  LuCheck,
  LuTriangleAlert,
  LuLoader,
} from "react-icons/lu";

export default function EditJob() {
  const userId = getCookie("userId");
  const { jobId } = useParams();
  const navigate = useNavigate();

  const defaultJob = {
    title: "",
    company: "",
    location: "",
    type: "Full-Time",
    category: "",
    experience: "",
    workMode: "On-site",
    salaryMin: "",
    salaryMax: "",
    salaryPeriod: "monthly",
    vacancies: 1,
    description: "",
    additionalRequirements: "",
    applicationDeadline: "",
    status: "active",
  };

  const [job, setJob] = useState(defaultJob);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [benefits, setBenefits] = useState(["Flexible hours"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitLabel, setSubmitLabel] = useState("Update job");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifyingPassword, setVerifyingPassword] = useState(false);

  const suggestedSkills = [
    "React",
    "Node.js",
    "MongoDB",
    "TypeScript",
    "Express.js",
    "REST APIs",
    "Git",
    "AWS",
    "Docker",
    "PostgreSQL",
    "Redis",
    "Tailwind CSS",
  ];

  const benefitOptions = [
    "Health insurance",
    "Flexible hours",
    "Work from home",
    "Stock options",
    "Paid leaves",
    "Learning budget",
    "Food allowance",
    "Travel allowance",
    "Parental leave",
  ];

  // ================= TOASTS =================
  function showToast(message, type = "success") {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  // ================= LOAD JOB DATA =================
  useEffect(() => {
    async function loadJob() {
      try {
        setIsLoading(true);
        const res = await fetch(
          `${API_BASE}/api/jobs/employer/${userId}/job/${jobId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          showToast("Failed to load job", "error");
          navigate("/employer-dashboard");
          return;
        }

        const data = await res.json();

        setJob({
          title: data.title || "",
          company: data.company || "",
          location: data.location || "",
          type: data.type || "Full-Time",
          category: data.category || "",
          experience: data.experience || "",
          workMode: data.workMode || "On-site",
          salaryMin: data.salaryMin || "",
          salaryMax: data.salaryMax || "",
          salaryPeriod: data.salaryPeriod || "monthly",
          vacancies: data.vacancies || 1,
          description: data.description || "",
          additionalRequirements: data.additionalRequirements || "",
          applicationDeadline: data.closingDate
            ? new Date(data.closingDate).toISOString().split("T")[0]
            : "",
          status: data.status || "active",
        });

        if (Array.isArray(data.requirements)) {
          setSkills(data.requirements);
        }

        if (Array.isArray(data.benefits)) {
          setBenefits(data.benefits);
        }

        showToast("Job loaded successfully", "success");
      } catch (error) {
        console.error("Error loading job:", error);
        showToast("Error loading job details", "error");
        navigate("/employer-dashboard");
      } finally {
        setIsLoading(false);
      }
    }

    if (userId && jobId) {
      loadJob();
    }
  }, [userId, jobId, navigate]);

  // ================= HANDLERS =================
  function handleChange(e) {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const nextErrors = { ...errors };
      delete nextErrors[name];
      setErrors(nextErrors);
    }
  }

  function markTouched(field) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setSkillInput("");
      showToast("Skill already added", "info");
      return;
    }

    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");

    if (errors.skills) {
      const nextErrors = { ...errors };
      delete nextErrors.skills;
      setErrors(nextErrors);
    }
  }

  function removeSkill(skillToRemove) {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
  }

  function quickAddSkill(skill) {
    if (skills.some((s) => s.toLowerCase() === skill.toLowerCase())) return;

    setSkills((prev) => [...prev, skill]);

    if (errors.skills) {
      const nextErrors = { ...errors };
      delete nextErrors.skills;
      setErrors(nextErrors);
    }
  }

  function toggleBenefit(benefit) {
    setBenefits((prev) =>
      prev.includes(benefit)
        ? prev.filter((b) => b !== benefit)
        : [...prev, benefit]
    );
  }

  // ================= VALIDATION =================
  function validateForm() {
    const nextErrors = {};

    if (!job.title.trim()) nextErrors.title = "Job title is required";
    if (!job.company.trim()) nextErrors.company = "Company name is required";
    if (!job.location.trim()) nextErrors.location = "Location is required";
    if (!job.type.trim()) nextErrors.type = "Job type is required";

    if (!job.description.trim()) {
      nextErrors.description = "Job description is required";
    } else if (job.description.trim().length < 50) {
      nextErrors.description = "Description should be at least 50 characters";
    }

    if (skills.length === 0) {
      nextErrors.skills = "Add at least 1 required skill";
    }

    if (
      job.salaryMin &&
      job.salaryMax &&
      Number(job.salaryMin) > Number(job.salaryMax)
    ) {
      nextErrors.salaryMax = "Maximum salary must be greater than minimum salary";
    }

    if (job.vacancies && Number(job.vacancies) < 1) {
      nextErrors.vacancies = "Vacancies must be at least 1";
    }

    if (job.applicationDeadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(job.applicationDeadline);
      selectedDate.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        nextErrors.applicationDeadline = "Deadline cannot be in the past";
      }
    }

    return nextErrors;
  }

  const liveErrors = useMemo(() => validateForm(), [job, skills]);

  function inputClass(field) {
    const hasError = errors[field];
    return `w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;
  }

  function showFieldError(field) {
    return errors[field] && (touched[field] || isSubmitting);
  }

  // ================= SUBMIT =================
  async function submitJob(e) {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    setTouched({
      title: true,
      location: true,
      type: true,
      description: true,
      skills: true,
      salaryMax: true,
      vacancies: true,
      applicationDeadline: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    // Show password modal instead of directly submitting
    setShowPasswordModal(true);
  }

  // ================= VERIFY PASSWORD & UPDATE JOB =================
  async function confirmJobUpdate() {
    if (!passwordInput.trim()) {
      setPasswordError("Password is required");
      return;
    }

    setVerifyingPassword(true);
    setPasswordError("");

    try {
      // Verify password
      const verifyRes = await fetch(`${API_BASE}/api/auth/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ password: passwordInput }),
      });

      if (!verifyRes.ok) {
        const data = await verifyRes.json();
        setPasswordError(data.message || "Incorrect password");
        setVerifyingPassword(false);
        return;
      }

      // Password verified, now update the job
      setIsSubmitting(true);
      setSubmitLabel("Updating...");

      const payload = {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: skills,
        skillsRequired: skills.join(", "),
        category: job.category,
        experience: job.experience,
        workMode: job.workMode,
        salaryMin: job.salaryMin ? Number(job.salaryMin) : undefined,
        salaryMax: job.salaryMax ? Number(job.salaryMax) : undefined,
        salaryPeriod: job.salaryPeriod,
        vacancies: Number(job.vacancies || 1),
        additionalRequirements: job.additionalRequirements,
        benefits,
        closingDate: job.applicationDeadline || undefined,
        status: job.status,
      };

      const res = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to update job", "error");
        setSubmitLabel("Update job");
        setIsSubmitting(false);
        setShowPasswordModal(false);
        setPasswordInput("");
        setVerifyingPassword(false);
        return;
      }

      setSubmitLabel("✓ Updated!");
      showToast("Job updated successfully!", "success");
      setShowPasswordModal(false);
      setPasswordInput("");

      setTimeout(() => {
        navigate(`/employer-dashboard/applicants/${jobId}`);
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong while updating the job", "error");
      setSubmitLabel("Update job");
      setPasswordError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
      setVerifyingPassword(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LuLoader className="text-4xl text-orange-500 animate-spin" />
          <p className="text-stone-600 font-semibold">Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* TOASTS */}
      <div className="fixed right-4 top-4 z-[100] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] max-w-[360px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-green-200 bg-white text-green-700"
                : toast.type === "error"
                ? "border-red-200 bg-white text-red-700"
                : "border-blue-200 bg-white text-blue-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {toast.type === "success" ? (
                  <LuCheck />
                ) : toast.type === "error" ? (
                  <LuTriangleAlert />
                ) : (
                  <LuInfo />
                )}
              </div>
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={submitJob} className="pb-8">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  Edit job listing
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  Update the job details to attract better applicants
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/employer-dashboard/applicants/${jobId}`)}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-300 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-70"
                >
                  {submitLabel}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
          {/* MAIN */}
          <div className="space-y-6">
            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <LuTriangleAlert className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Please fix the following before updating
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-700">
                      {Object.values(errors).map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Section 1 */}
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">
                      Basic information
                    </h2>
                    <p className="text-xs text-stone-500">
                      Core listing details candidates see first
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Job title <span className="text-orange-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={job.title}
                    onChange={handleChange}
                    onBlur={() => markTouched("title")}
                    required
                    placeholder="e.g. Senior Frontend Developer"
                    className={inputClass("title")}
                  />
                  {showFieldError("title") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Company name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      name="company"
                      value={job.company}
                      disabled
                      placeholder="e.g. Microsoft"
                      className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none cursor-not-allowed text-stone-600"
                    />
                    <p className="mt-1 text-xs text-stone-500">
                      This is auto-filled from your employer profile
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Location <span className="text-orange-500">*</span>
                    </label>
                    <input
                      name="location"
                      value={job.location}
                      onChange={handleChange}
                      onBlur={() => markTouched("location")}
                      required
                      placeholder="e.g. Lucknow, India"
                      className={inputClass("location")}
                    />
                    {showFieldError("location") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">
                      Job details
                    </h2>
                    <p className="text-xs text-stone-500">
                      Type, work mode, category, and experience
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Job type <span className="text-orange-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={job.type}
                      onChange={handleChange}
                      onBlur={() => markTouched("type")}
                      className={inputClass("type")}
                    >
                      <option>Full-Time</option>
                      <option>Part-Time</option>
                      <option>Internship</option>
                      <option>Contract</option>
                      <option>Freelance</option>
                    </select>
                    {showFieldError("type") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Category / Department
                    </label>
                    <select
                      name="category"
                      value={job.category}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">Select category</option>
                      <option>Engineering</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Finance</option>
                      <option>HR / Recruitment</option>
                      <option>Sales</option>
                      <option>Operations</option>
                      <option>Product</option>
                      <option>Data / Analytics</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Experience required
                    </label>
                    <select
                      name="experience"
                      value={job.experience}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">Select level</option>
                      <option>Fresher</option>
                      <option>1–3 yrs</option>
                      <option>3–5 yrs</option>
                      <option>5+ yrs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Work mode
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {["On-site", "Remote", "Hybrid"].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          setJob((prev) => ({ ...prev, workMode: mode }))
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          job.workMode === mode
                            ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                            : "border-stone-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        <div className="text-lg">
                          {mode === "On-site" ? "🏢" : mode === "Remote" ? "🏠" : "🔀"}
                        </div>
                        <div className="mt-2 text-sm font-bold text-stone-900">
                          {mode}
                        </div>
                        <div className="mt-1 text-xs text-stone-500">
                          {mode === "On-site"
                            ? "Work from office"
                            : mode === "Remote"
                            ? "Work from anywhere"
                            : "Mix of both"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Job description <span className="text-orange-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={job.description}
                    onChange={handleChange}
                    onBlur={() => markTouched("description")}
                    rows={6}
                    required
                    placeholder="Describe the role, responsibilities, team, growth opportunities, and what success looks like..."
                    className={inputClass("description")}
                  />
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs text-stone-400">
                      Aim for at least 50 characters (recommended: 200–500 words)
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        job.description.length > 1800
                          ? "text-amber-600"
                          : "text-stone-400"
                      }`}
                    >
                      {job.description.length} / 2000
                    </span>
                  </div>
                  {showFieldError("description") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">
                      Compensation
                    </h2>
                    <p className="text-xs text-stone-500">
                      Salary and openings — disclosed salaries perform better
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Salary range
                  </label>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto_1fr_140px] md:items-end">
                    <div>
                      <label className="mb-2 block text-xs font-medium text-stone-400">
                        Minimum (₹)
                      </label>
                      <input
                        type="number"
                        name="salaryMin"
                        value={job.salaryMin}
                        onChange={handleChange}
                        placeholder="e.g. 600000"
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div className="hidden md:block pb-3 text-stone-400 font-bold">
                      —
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-stone-400">
                        Maximum (₹)
                      </label>
                      <input
                        type="number"
                        name="salaryMax"
                        value={job.salaryMax}
                        onChange={handleChange}
                        onBlur={() => markTouched("salaryMax")}
                        placeholder="e.g. 1200000"
                        className={inputClass("salaryMax")}
                      />
                      {showFieldError("salaryMax") && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          {errors.salaryMax}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium text-stone-400">
                        Period
                      </label>
                      <select
                        name="salaryPeriod"
                        value={job.salaryPeriod}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="monthly">Per month</option>
                        <option value="yearly">Per year</option>
                        <option value="project">Per project</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Vacancies / openings
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="vacancies"
                    value={job.vacancies}
                    onChange={handleChange}
                    onBlur={() => markTouched("vacancies")}
                    className={inputClass("vacancies") + " max-w-[180px]"}
                  />
                  {showFieldError("vacancies") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.vacancies}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">
                      Skills & requirements
                    </h2>
                    <p className="text-xs text-stone-500">
                      Powers matching and resume scoring
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Required skills <span className="text-orange-500">*</span>
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onBlur={() => markTouched("skills")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill and press Enter..."
                      className={`flex-1 rounded-xl border bg-white px-4 py-3 text-sm outline-none transition ${
                        showFieldError("skills")
                          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                          : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white"
                    >
                      <LuPlus />
                      Add
                    </button>
                  </div>

                  {showFieldError("skills") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.skills}
                    </p>
                  )}

                  {skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skills.map((skill) => (
                        <div
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 border border-orange-200"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-orange-500 hover:text-orange-700"
                          >
                            <LuX className="text-sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {skills.length < 5 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-stone-600 uppercase tracking-wide">
                      Quick add suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSkills
                        .filter((s) => !skills.includes(s))
                        .map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => quickAddSkill(skill)}
                            className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-600 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                          >
                            + {skill}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Section 5 */}
            <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">Job status</h2>
                    <p className="text-xs text-stone-500">
                      Control whether the job is visible to applicants
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div className="max-w-sm">
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={job.status}
                    onChange={handleChange}
                    onBlur={() => markTouched("status")}
                    className={inputClass("status")}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                  <p className="mt-1 text-xs text-stone-500">
                    Use “Paused” to temporarily stop new applications.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordInput("");
              setPasswordError("");
            }}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white shadow-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-stone-900">
                Confirm with Password
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Enter your password to update this job listing
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setPasswordError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !verifyingPassword) {
                      confirmJobUpdate();
                    }
                  }}
                  placeholder="Enter your password"
                  disabled={verifyingPassword}
                  autoFocus
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    passwordError
                      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                      : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  }`}
                />
                {passwordError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                  setPasswordError("");
                }}
                disabled={verifyingPassword}
                className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmJobUpdate}
                disabled={verifyingPassword}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
              >
                {verifyingPassword ? "Verifying..." : "Confirm"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
