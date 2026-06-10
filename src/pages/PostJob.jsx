import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import {
  LuInfo,
  LuPlus,
  LuX,
  LuSparkles,
  LuCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import { getCookie } from "../utils/cookies";

const DRAFT_KEY = "jobnexus_postjob_draft_v2";

export default function PostJob() {
  const session = getCookie("session");

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
  const [submitLabel, setSubmitLabel] = useState("Publish job listing");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [profileLoading, setProfileLoading] = useState(true);

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

  // ---------------- TOASTS ----------------
  function showToast(message, type = "success") {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    setToasts((prev) => [...prev, toast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  // ---------------- FETCH EMPLOYER PROFILE ----------------
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE}/api/users/me`, {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          if (data.companyName) {
            setJob((prev) => ({ ...prev, company: data.companyName }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setProfileLoading(false);
      }
    }

    if (session) {
      fetchProfile();
    } else {
      setProfileLoading(false);
    }
  }, [session]);

  // ---------------- DRAFT RESTORE ----------------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed?.job) {
          setJob({ ...defaultJob, ...parsed.job });
        }
        if (Array.isArray(parsed?.skills)) {
          setSkills(parsed.skills);
        }
        if (Array.isArray(parsed?.benefits)) {
          setBenefits(parsed.benefits);
        }

        showToast("Draft restored from local storage", "info");
      }
    } catch (error) {
      console.error("Failed to restore draft:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  // ---------------- AUTO SAVE DRAFT ----------------
  useEffect(() => {
    if (!hydrated) return;

    const hasMeaningfulData =
      job.title ||
      job.company ||
      job.location ||
      job.description ||
      skills.length > 0;

    if (!hasMeaningfulData) return;

    const payload = {
      job,
      skills,
      benefits,
      updatedAt: Date.now(),
    };

    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, [job, skills, benefits, hydrated]);

  // ---------------- HANDLERS ----------------
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

  function saveDraftManually() {
    try {
      const payload = {
        job,
        skills,
        benefits,
        updatedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      showToast("Draft saved successfully", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save draft", "error");
    }
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    setJob(defaultJob);
    setSkills([]);
    setBenefits(["Flexible hours"]);
    setErrors({});
    setTouched({});
    showToast("Draft cleared", "info");
  }

  // ---------------- VALIDATION ----------------
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

  // ---------------- COMPLETION ----------------
  const completion = useMemo(() => {
    const checks = {
      title: !!job.title.trim(),
      company: !!job.company.trim(),
      location: !!job.location.trim(),
      type: !!job.type,
      description: job.description.trim().length >= 50,
      skills: skills.length > 0,
      experience: !!job.experience,
      salary: !!(job.salaryMin || job.salaryMax),
      deadline: !!job.applicationDeadline,
    };

    const total = Object.keys(checks).length;
    const done = Object.values(checks).filter(Boolean).length;
    const percentage = Math.round((done / total) * 100);

    return { checks, total, done, percentage };
  }, [job, skills]);

  // ---------------- HELPERS ----------------
  function formatSalaryPreview() {
    const { salaryMin, salaryMax, salaryPeriod } = job;

    if (!salaryMin && !salaryMax) return "Not disclosed";

    const fmt = (v) => Number(v).toLocaleString("en-IN");
    const suffixMap = {
      monthly: "/mo",
      yearly: "/yr",
      project: "/project",
    };

    const suffix = suffixMap[salaryPeriod] || "/mo";

    if (salaryMin && salaryMax) {
      return `₹${fmt(salaryMin)} – ₹${fmt(salaryMax)} ${suffix}`;
    }

    if (salaryMin) {
      return `₹${fmt(salaryMin)}+ ${suffix}`;
    }

    return `Up to ₹${fmt(salaryMax)} ${suffix}`;
  }

  function inputClass(field) {
    const hasError = errors[field];
    return `w-full rounded-xl border bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-red-500/40 dark:focus:border-red-400 dark:focus:ring-red-500/20"
        : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:focus:border-orange-400 dark:focus:ring-orange-500/20"
    }`;
  }

  function showFieldError(field) {
    return errors[field] && (touched[field] || isSubmitting);
  }

  // ---------------- SUBMIT ----------------
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

    setIsSubmitting(true);
    setSubmitLabel("Publishing...");

    try {
      const payload = {
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        description: job.description,

        // Recommended / fixed field for your app
        requirements: skills,

        // Optional backward compatibility for inconsistent backend
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

      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to post job", "error");
        setSubmitLabel("Publish job listing");
        setIsSubmitting(false);
        return;
      }

      setSubmitLabel("✓ Published!");
      showToast("Job posted successfully!", "success");

      // Clear draft + reset form after success
      localStorage.removeItem(DRAFT_KEY);

      setTimeout(() => {
        setJob(defaultJob);
        setSkills([]);
        setBenefits(["Flexible hours"]);
        setErrors({});
        setTouched({});
        setSubmitLabel("Publish job listing");
      }, 1000);
    } catch (error) {
      console.error(error);
      showToast("Something went wrong while posting the job", "error");
      setSubmitLabel("Publish job listing");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      {/* TOASTS */}
      <div className="fixed right-4 top-4 z-[100] space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`min-w-[260px] max-w-[360px] rounded-2xl border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === "success"
                ? "border-green-200 bg-white text-green-700 dark:border-green-500/30 dark:bg-stone-900 dark:text-green-200"
                : toast.type === "error"
                ? "border-red-200 bg-white text-red-700 dark:border-red-500/30 dark:bg-stone-900 dark:text-red-200"
                : "border-blue-200 bg-white text-blue-700 dark:border-blue-500/30 dark:bg-stone-900 dark:text-blue-200"
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
        <div className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur-md dark:border-stone-800 dark:bg-stone-950/80">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  Post a new job
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  Create a polished listing that attracts better applicants
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveDraftManually}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-orange-300"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-red-200 hover:text-red-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-red-500/40 dark:hover:text-red-200"
                >
                  Clear draft
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

            {/* Progress Steps */}
            <div className="mt-4 hidden md:flex items-center gap-3 overflow-x-auto">
              {[
                "Basics",
                "Details",
                "Compensation",
                "Skills",
                "Settings",
              ].map((step, index) => {
                const activeIndex =
                  completion.percentage >= 90
                    ? 4
                    : completion.percentage >= 70
                    ? 3
                    : completion.percentage >= 50
                    ? 2
                    : completion.percentage >= 25
                    ? 1
                    : 0;

                const isDone = index < activeIndex;
                const isActive = index === activeIndex;

                return (
                  <div key={step} className="flex items-center gap-3 shrink-0">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-orange-500 text-white"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        isDone
                          ? "text-green-600"
                          : isActive
                          ? "text-orange-600"
                          : "text-stone-400"
                      }`}
                    >
                      {step}
                    </span>
                    {index !== 4 && (
                      <div
                        className={`h-[2px] w-10 ${
                          isDone ? "bg-green-300" : "bg-stone-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
          {/* MAIN */}
          <div className="space-y-6">
            {/* Validation Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
                <div className="flex items-start gap-3">
                  <LuTriangleAlert className="mt-0.5 shrink-0 text-red-600" />
                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Please fix the following before publishing
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
                      className="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 outline-none dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300"
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
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-orange-500/20"
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
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-orange-500/20"
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
                            ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:ring-orange-500/20"
                            : "border-stone-200 bg-white hover:border-orange-200 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-orange-500/40"
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
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:ring-orange-500/20"
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
                        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:focus:ring-orange-500/20"
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
                      className={`flex-1 rounded-xl border bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 ${
                        showFieldError("skills")
                          ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:border-red-500/40 dark:focus:ring-red-500/20"
                          : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:focus:ring-orange-500/20"
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
                    <p className="mt-2 text-xs font-medium text-red-600">
                      {errors.skills}
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-orange-400 hover:text-red-500"
                          >
                            <LuX size={14} />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-400">No skills added yet</span>
                    )}
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-stone-400">
                      Quick add suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSkills.map((skill) => {
                        const alreadyAdded = skills.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => quickAddSkill(skill)}
                            disabled={alreadyAdded}
                            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              alreadyAdded
                                ? "cursor-not-allowed border border-stone-200 bg-stone-100 text-stone-400"
                                : "border border-dashed border-orange-300 text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-500/10"
                            }`}
                          >
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Additional requirements
                  </label>
                  <textarea
                    name="additionalRequirements"
                    value={job.additionalRequirements}
                    onChange={handleChange}
                    rows={4}
                    placeholder="e.g. B.Tech preferred, strong communication skills, willingness to travel..."
                    className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:ring-orange-500/20"
                  />
                </div>
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
                    <h2 className="text-base font-bold text-stone-900">
                      Perks & settings
                    </h2>
                    <p className="text-xs text-stone-500">
                      Optional perks and publishing preferences
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Perks & benefits
                  </label>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {benefitOptions.map((benefit) => {
                      const active = benefits.includes(benefit);
                      return (
                        <button
                          key={benefit}
                          type="button"
                          onClick={() => toggleBenefit(benefit)}
                          className={`rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-orange-300 bg-orange-50 dark:border-orange-500/40 dark:bg-orange-500/10"
                              : "border-stone-200 bg-white hover:border-orange-200 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-orange-500/40"
                          }`}
                        >
                          <div className="text-sm font-semibold text-stone-800">
                            {benefit}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Application deadline
                    </label>
                    <input
                      type="date"
                      name="applicationDeadline"
                      value={job.applicationDeadline}
                      onChange={handleChange}
                      onBlur={() => markTouched("applicationDeadline")}
                      className={inputClass("applicationDeadline")}
                    />
                    {showFieldError("applicationDeadline") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.applicationDeadline}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Initial listing status
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        { key: "active", label: "Active", activeCls: "border-green-300 bg-green-50 text-green-700" },
                        { key: "paused", label: "Paused", activeCls: "border-amber-300 bg-amber-50 text-amber-700" },
                        { key: "closed", label: "Closed", activeCls: "border-red-300 bg-red-50 text-red-700" },
                      ].map((status) => {
                        const active = job.status === status.key;

                        return (
                          <button
                            key={status.key}
                            type="button"
                            onClick={() =>
                              setJob((prev) => ({ ...prev, status: status.key }))
                            }
                            className={`rounded-xl border p-3 text-left transition ${
                              active
                                ? status.activeCls
                                : "border-stone-200 hover:border-orange-200"
                            }`}
                          >
                            <div className="text-sm font-bold">{status.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            {/* Live Preview */}
            <div className="sticky top-28 space-y-6">
              <div className="overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-sm dark:border-orange-500/30 dark:bg-stone-900">
                <div className="flex items-center justify-between border-b border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-500/30 dark:bg-orange-500/10">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold text-orange-700">
                      Live preview
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-orange-600">
                    Updates instantly
                  </span>
                </div>

                <div className="p-4">
                  <h3
                    className={`text-base font-extrabold ${
                      job.title ? "text-stone-900" : "italic text-stone-400"
                    }`}
                  >
                    {job.title || "Job title will appear here..."}
                  </h3>

                  <p className="mt-1 text-sm text-stone-500">
                    {job.company || "Company name"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-200">
                      {job.type}
                    </span>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-200">
                      {job.workMode}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ["Location", job.location || "Not set"],
                      ["Category", job.category || "Not set"],
                      ["Experience", job.experience || "Not set"],
                      ["Salary", formatSalaryPreview()],
                      [
                        "Vacancies",
                        `${job.vacancies || 1} opening${
                          Number(job.vacancies || 1) > 1 ? "s" : ""
                        }`,
                      ],
                      [
                        "Deadline",
                        job.applicationDeadline
                          ? new Date(job.applicationDeadline).toLocaleDateString("en-IN")
                          : "No deadline",
                      ],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-stone-100 pb-2 last:border-b-0"
                      >
                        <span className="text-xs text-stone-500">{label}</span>
                        <span
                          className={`max-w-[65%] text-right text-xs font-semibold ${
                            value === "Not set" || value === "No deadline"
                              ? "text-stone-400"
                              : "text-stone-700"
                          }`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-stone-400">
                      Required skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {skills.length > 0 ? (
                        skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-200"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-stone-400">No skills added</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Completion */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="text-sm font-bold text-stone-900">Listing completeness</h3>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        completion.percentage >= 80
                          ? "bg-green-500"
                          : completion.percentage >= 50
                          ? "bg-amber-500"
                          : "bg-orange-500"
                      }`}
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-extrabold text-orange-600">
                    {completion.percentage}%
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {[
                    ["Job title", completion.checks.title],
                    ["Company", completion.checks.company],
                    ["Location", completion.checks.location],
                    ["Job type", completion.checks.type],
                    ["Description", completion.checks.description],
                    ["Skills added", completion.checks.skills],
                    ["Experience level", completion.checks.experience],
                    ["Salary range", completion.checks.salary],
                    ["Application deadline", completion.checks.deadline],
                  ].map(([label, done]) => (
                    <div key={label} className="flex items-center gap-2">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border text-[10px] ${
                          done
                            ? "border-green-200 bg-green-50 text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                            : "border-stone-200 bg-stone-50 text-transparent dark:border-stone-800 dark:bg-stone-950"
                        }`}
                      >
                        ✓
                      </div>
                      <span
                        className={`text-sm ${
                          done ? "font-medium text-stone-700" : "text-stone-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <LuSparkles className="text-orange-500" />
                  Tips for more applicants
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    "Always include salary range — disclosed salaries get more applications",
                    "Set an experience level so freshers don't apply to senior roles",
                    "Add 5–10 important skills to improve matching quality",
                    "Set a deadline so hiring stays focused",
                    "Perks like remote work and insurance improve conversion",
                  ].map((tip, i) => (
                    <div key={tip} className="flex items-start gap-3">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-bold text-orange-600">
                        {i + 1}
                      </div>
                      <p className="text-sm text-stone-500">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Draft status */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
                <div className="flex items-start gap-3">
                  <LuInfo className="mt-0.5 shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-blue-700">Draft autosave enabled</p>
                    <p className="mt-1 text-sm text-blue-700/80">
                      Your form is being saved locally as you type.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /SIDEBAR */}
        </div>
      </form>
    </div>
  );
}