import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import { Link, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import {
  LuSearch,
  LuMapPin,
  LuBriefcase,
  LuFileText,
  LuBadgeIndianRupee,
  LuBuilding2,
  LuChevronRight,
  LuSparkles,
  LuLoaderCircle,
  LuTriangleAlert,
  LuHouse,
  LuBadgeCheck,
  LuArrowRight,
} from "react-icons/lu";
import { FaChartLine } from "react-icons/fa";

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [jobsError, setJobsError] = useState("");

  const navigate = useNavigate();
  const role = getCookie("role");
  const userName = getCookie("name");

  useEffect(() => {
    loadFeaturedJobs();
  }, []);

  async function loadFeaturedJobs() {
    setLoadingJobs(true);
    setJobsError("");

    try {
      const res = await fetch(`${API_BASE}/api/jobs`);

      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }

      if (!res.ok) {
        setJobsError(data?.message || "Failed to load featured jobs");
        setJobs([]);
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setJobs(list.slice(0, 6));
    } catch (error) {
      console.error("Failed to load featured jobs:", error);
      setJobsError("Failed to load featured jobs");
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }

  function handleSearch() {
    const params = new URLSearchParams();

    if (title.trim()) params.append("title", title.trim());
    if (location.trim()) params.append("location", location.trim());

    const query = params.toString();
    navigate(query ? `/jobs?${query}` : "/jobs");
  }

  function handleSearchKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  }

  function formatSalary(job) {
    // New model support
    if (job.salaryMin || job.salaryMax) {
      const min = job.salaryMin ? Number(job.salaryMin).toLocaleString("en-IN") : null;
      const max = job.salaryMax ? Number(job.salaryMax).toLocaleString("en-IN") : null;
      const period = job.salaryPeriod || "month";

      if (min && max) return `₹${min} - ₹${max} / ${period}`;
      if (min) return `₹${min}+ / ${period}`;
      if (max) return `Up to ₹${max} / ${period}`;
    }

    // Old model support
    if (job.salary) {
      return `₹${Number(job.salary).toLocaleString("en-IN")}`;
    }

    return "Salary not disclosed";
  }

  function getWorkMode(job) {
    if (job.workMode) return job.workMode;
    if (job.remote === true) return "Remote";
    return "On-site";
  }

  function getInitial(company) {
    return (company || "J").charAt(0).toUpperCase();
  }

  const stats = useMemo(() => {
    return [
      {
        label: "Active Opportunities",
        value: jobs.length > 0 ? `${jobs.length}+` : "100+",
        icon: <LuBriefcase size={18} />,
      },
      {
        label: "ATS-Friendly Resumes",
        value: "Built Fast",
        icon: <LuFileText size={18} />,
      },
      {
        label: "Career Growth",
        value: "All-in-One",
        icon: <FaChartLine size={16} />,
      },
    ];
  }, [jobs.length]);

  return (
    <div className="min-h-screen bg-stone-100">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-stone-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white dark:border-stone-800 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
        {/* Soft background accents */}
        <div className="absolute -left-20 top-10 h-56 w-56 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            {/* Left */}
            <div>
              <div className="flex max-w-full flex-wrap items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 shadow-sm">
                <LuSparkles size={14} />
                Smart Job Search + Resume Builder
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
                Find your <span className="text-orange-600">dream job</span> and
                <br className="hidden sm:block" /> build a standout resume
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
                Discover curated opportunities, apply faster, and create an ATS-friendly
                resume that helps you stand out — all inside one clean hiring platform.
              </p>

              {/* Search Panel */}
              <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-lg sm:p-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.15fr_1fr_auto]">
                  <div className="relative">
                    <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      placeholder="Job title, skill, or company"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 pl-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>

                  <div className="relative">
                    <LuMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      placeholder="City, state, or Remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 pl-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:text-stone-100 dark:placeholder:text-stone-500"
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-sm font-bold text-white transition hover:bg-orange-600 lg:w-auto"
                  >
                    <LuSearch size={16} />
                    Search Jobs
                  </button>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-2xl bg-stone-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-stone-800"
                >
                  Explore all jobs
                  <LuArrowRight size={16} />
                </Link>

                <Link
                  to="/resume"
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-300 bg-white px-5 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-50 dark:border-orange-400/60 dark:hover:bg-orange-500/10"
                >
                  <LuFileText size={16} />
                  Build resume
                </Link>
              </div>

              {/* Welcome chip */}
              {userName && (
                <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm">
                  <LuBadgeCheck size={14} className="shrink-0 text-green-600" />
                  <span className="min-w-0 truncate">
                    Welcome back, {userName}
                    {role ? ` (${role})` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Right hero card */}
            <div className="relative">
              <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-xl sm:p-6">
                <div className="rounded-3xl bg-stone-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Career Dashboard
                      </p>
                      <h3 className="mt-1 text-xl font-black text-stone-900">
                        Apply smarter, faster
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-orange-100 p-3 text-orange-600">
                      <LuBriefcase size={20} />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    {stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-stone-200 bg-white p-4"
                      >
                        <div className="mb-3 inline-flex rounded-2xl bg-orange-50 p-2 text-orange-600">
                          {item.icon}
                        </div>
                        <p className="text-lg font-black text-stone-900">{item.value}</p>
                        <p className="text-xs font-medium text-stone-500">{item.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      Why JobNexus?
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-stone-600">
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Search jobs with filters that actually help
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Build ATS-friendly resumes in minutes
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-orange-500" />
                        Track applications from one dashboard
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              <LuBriefcase size={14} />
              Handpicked Opportunities
            </div>
            <h2 className="mt-3 text-3xl font-black text-stone-900">Featured Jobs</h2>
            <p className="mt-2 text-sm text-stone-500">
              Explore some of the latest opportunities available right now.
            </p>
          </div>

          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 dark:hover:border-orange-400/60 dark:hover:bg-orange-500/10"
          >
            View all jobs
            <LuChevronRight size={16} />
          </Link>
        </div>

        {/* Loading */}
        {loadingJobs && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <div className="animate-pulse">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-stone-200" />
                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-stone-200" />
                      <div className="mt-2 h-3 w-20 rounded bg-stone-100" />
                    </div>
                  </div>
                  <div className="h-5 w-3/4 rounded bg-stone-200" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-full rounded bg-stone-100" />
                    <div className="h-3 w-5/6 rounded bg-stone-100" />
                    <div className="h-3 w-4/6 rounded bg-stone-100" />
                  </div>
                  <div className="mt-5 h-10 w-full rounded-2xl bg-stone-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loadingJobs && jobsError && (
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <LuTriangleAlert size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Could not load featured jobs</h3>
                <p className="mt-1 text-sm text-stone-600">{jobsError}</p>
                <button
                  onClick={loadFeaturedJobs}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <LuLoaderCircle size={16} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty */}
        {!loadingJobs && !jobsError && jobs.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
              <LuBriefcase size={28} />
            </div>
            <h3 className="mt-4 text-2xl font-black text-stone-900">No featured jobs yet</h3>
            <p className="mt-2 text-sm text-stone-500">
              Check back soon or explore the full jobs page.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600"
            >
              Browse jobs
              <LuChevronRight />
            </Link>
          </div>
        )}

        {/* Featured Cards */}
        {!loadingJobs && !jobsError && jobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-lg font-black text-orange-600">
                        {getInitial(job.company)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-stone-900">
                          {job.company || "Unknown Company"}
                        </p>
                        <p className="text-xs text-stone-500">Featured employer</p>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                        {job.type || "Full-Time"}
                      </span>

                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                        {getWorkMode(job)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-xl font-black text-stone-900 transition group-hover:text-orange-600">
                      {job.title || "Untitled Job"}
                    </h3>

                    <div className="mt-4 space-y-2 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <LuMapPin className="text-stone-400" />
                        <span>{job.location || "Unknown Location"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <LuBadgeIndianRupee className="text-stone-400" />
                        <span>{formatSalary(job)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <LuHouse className="text-stone-400" />
                        <span>{getWorkMode(job)}</span>
                      </div>
                    </div>

                    {job.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-500">
                        {job.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                    >
                      View Job
                      <LuChevronRight size={16} />
                    </Link>

                    <button
                      onClick={() => navigate(`/jobs?title=${encodeURIComponent(job.title || "")}`)}
                      className="inline-flex items-center justify-center rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 dark:hover:border-orange-400/60 dark:hover:bg-orange-500/10"
                    >
                      Similar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RESUME BUILDER PROMO */}
      <section className="relative overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 via-stone-900 to-stone-900" />
        <div className="absolute -right-16 top-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-300">
                <LuFileText className="h-4 w-4" />
                AI-Powered Resume Builder
              </div>

              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                Create a professional resume in minutes, not hours
              </h2>

              <p className="text-sm leading-7 text-stone-300 sm:text-base">
                Build an ATS-friendly resume with a guided flow, polished layouts, and
                sections that help recruiters quickly understand your strengths.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/resume"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto"
                >
                  Build My Resume
                  <LuChevronRight size={16} />
                </Link>

                <Link
                  to="/jobs"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-700 bg-stone-800 px-6 py-3 text-sm font-semibold text-stone-200 transition hover:bg-stone-700 sm:w-auto"
                >
                  Explore Jobs
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-2xl border border-stone-800 bg-stone-800/60 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-300">
                    <FaChartLine className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">ATS Friendly</p>
                    <p className="text-xs text-stone-400">Designed for screening systems</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-stone-800 bg-stone-800/60 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 text-orange-300">
                    <LuBuilding2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Pro Templates</p>
                    <p className="text-xs text-stone-400">Clean and recruiter-friendly</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Resume mockup */}
            <div className="relative">
              <div className="rounded-[28px] border border-stone-700 bg-white p-3 shadow-2xl transition duration-500 hover:rotate-0 sm:rotate-2">
                <div className="rounded-2xl border border-stone-100 bg-stone-50 p-6">
                  <div className="h-8 w-1/3 rounded bg-stone-200" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-stone-200" />
                  <div className="my-5 h-px w-full bg-stone-200" />

                  <div className="space-y-3">
                    <div className="h-4 w-full rounded bg-stone-100" />
                    <div className="h-4 w-5/6 rounded bg-stone-100" />
                    <div className="h-4 w-4/6 rounded bg-stone-100" />
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="h-4 w-full rounded bg-stone-100" />
                    <div className="h-4 w-5/6 rounded bg-stone-100" />
                    <div className="h-4 w-3/6 rounded bg-stone-100" />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="h-16 rounded-xl bg-stone-100" />
                    <div className="h-16 rounded-xl bg-stone-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[32px] border border-stone-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                <LuSparkles size={14} />
                Get Started Today
              </div>
              <h2 className="mt-4 text-2xl font-black text-stone-900 sm:text-3xl">
                Your next opportunity could be one search away
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-500 sm:text-base">
                Browse jobs, create a stronger resume, and manage your applications in one place.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-600 sm:w-auto"
              >
                Browse Jobs
                <LuChevronRight size={16} />
              </Link>

              <Link
                to="/resume"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 sm:w-auto"
              >
                Build Resume
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}