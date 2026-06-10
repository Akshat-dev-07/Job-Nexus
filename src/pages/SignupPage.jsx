import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";
import {
  LuBriefcase,
  LuUser,
  LuMail,
  LuLock,
  LuPhone,
  LuMapPin,
  LuBuilding2,
  LuGlobe,
  LuLayers3,
  LuUsers,
  LuBadgeCheck,
  LuTriangleAlert,
} from "react-icons/lu";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "candidate",

    // candidate
    phone: "",
    city: "",
    headline: "",
    experience: "fresher",

    // employer
    companyName: "",
    companyWebsite: "",
    industry: "",
    companySize: "1-10",
    companyCity: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      const next = { ...errors };
      delete next[name];
      setErrors(next);
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    } else if (!/\d/.test(form.password)) {
      nextErrors.password = "Password must contain at least 1 number";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    if (form.role === "employer" && !form.companyName.trim()) {
      nextErrors.companyName = "Company name is required for employers";
    }

    return nextErrors;
  }

  const passwordStrength = useMemo(() => {
    const pwd = form.password;
    if (!pwd) return { label: "None", score: 0 };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { label: "Weak", score: 1 };
    if (score <= 3) return { label: "Medium", score: 2 };
    return { label: "Strong", score: 3 };
  }, [form.password]);

  function inputClass(field) {
    return `w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
    }`;
  }

  async function handleSignup(e) {
    e.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,

        // candidate
        phone: form.phone,
        city: form.city,
        headline: form.headline,
        experience: form.experience,

        // employer
        companyName: form.companyName,
        companyWebsite: form.companyWebsite,
        industry: form.industry,
        companySize: form.companySize,
        companyCity: form.companyCity,
      };

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Server returned an invalid response" };
      }

      if (!res.ok) {
        showToast(data.message || "Signup failed", "error");
        setIsSubmitting(false);
        return;
      }

      showToast("Account created successfully!", "success");

      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (error) {
      console.error(error);
      showToast("Server not reachable", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`min-w-[260px] rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-200 bg-white text-green-700"
                : "border-red-200 bg-white text-red-700"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {toast.type === "success" ? <LuBadgeCheck /> : <LuTriangleAlert />}
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left visual panel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-10 text-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <LuBriefcase />
              JobNexus
            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight">
              Build your hiring
              <br />
              or career journey.
            </h1>

            <p className="mt-4 max-w-md text-white/85">
              Create your account in minutes. Candidates discover better jobs.
              Employers attract better talent.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Candidate accounts can apply faster and build resumes later",
              "Employer accounts can post jobs and manage applicants",
              "Employer verification helps reduce spam listings",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <form
            onSubmit={handleSignup}
            className="w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-stone-900">Create account</h2>
              <p className="mt-2 text-sm text-stone-500">
                Choose your account type and complete the essentials.
              </p>
            </div>

            {/* Role Switch */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: "candidate" }))}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.role === "candidate"
                    ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                    : "border-stone-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <LuUser className="text-orange-500" />
                  Candidate
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Apply to jobs and build your profile
                </p>
              </button>

              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, role: "employer" }))}
                className={`rounded-2xl border p-4 text-left transition ${
                  form.role === "employer"
                    ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                    : "border-stone-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900">
                  <LuBuilding2 className="text-orange-500" />
                  Employer
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Post jobs and manage applicants
                </p>
              </button>
            </div>

            {/* Common fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Full name *
                </label>
                <div className="relative">
                  <LuUser className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={inputClass("name") + " pl-11"}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Email *
                </label>
                <div className="relative">
                  <LuMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={inputClass("email") + " pl-11"}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
              </div>

              {form.role === "candidate" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Phone (optional)
                  </label>
                  <div className="relative">
                    <LuPhone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Password *
                </label>
                <div className="relative">
                  <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 chars"
                    className={inputClass("password") + " pl-11"}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}

                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full ${
                        passwordStrength.score === 1
                          ? "w-1/3 bg-red-500"
                          : passwordStrength.score === 2
                          ? "w-2/3 bg-amber-500"
                          : passwordStrength.score === 3
                          ? "w-full bg-green-500"
                          : "w-0"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-stone-500">
                    {passwordStrength.label}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Confirm password *
                </label>
                <div className="relative">
                  <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={inputClass("confirmPassword") + " pl-11"}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Candidate fields */}
            {form.role === "candidate" && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="mb-4 text-sm font-bold text-stone-900">Candidate profile</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      City (optional)
                    </label>
                    <div className="relative">
                      <LuMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Lucknow, India"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Experience
                    </label>
                    <select
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="fresher">Fresher</option>
                      <option value="1-3">1–3 yrs</option>
                      <option value="3-5">3–5 yrs</option>
                      <option value="5+">5+ yrs</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Headline (optional)
                    </label>
                    <input
                      name="headline"
                      value={form.headline}
                      onChange={handleChange}
                      placeholder="e.g. Frontend Developer / Fresher"
                      className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Employer fields */}
            {form.role === "employer" && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="mb-4 text-sm font-bold text-stone-900">Company details</p>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Company name *
                    </label>
                    <div className="relative">
                      <LuBuilding2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        name="companyName"
                        value={form.companyName}
                        onChange={handleChange}
                        placeholder="Your company / startup name"
                        className={inputClass("companyName") + " pl-11"}
                      />
                    </div>
                    {errors.companyName && (
                      <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Company website
                    </label>
                    <div className="relative">
                      <LuGlobe className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        name="companyWebsite"
                        value={form.companyWebsite}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Industry
                    </label>
                    <div className="relative">
                      <LuLayers3 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        name="industry"
                        value={form.industry}
                        onChange={handleChange}
                        placeholder="e.g. Technology"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Company size
                    </label>
                    <div className="relative">
                      <LuUsers className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <select
                        name="companySize"
                        value={form.companySize}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="1-10">1–10</option>
                        <option value="11-50">11–50</option>
                        <option value="51-200">51–200</option>
                        <option value="200+">200+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-stone-700">
                      Company city
                    </label>
                    <div className="relative">
                      <LuMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        name="companyCity"
                        value={form.companyCity}
                        onChange={handleChange}
                        placeholder="e.g. Bengaluru"
                        className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-medium text-amber-800">
                    Employer accounts may require admin verification before public job listings go live.
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-70"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-5 text-center text-sm text-stone-500">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-orange-600 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}