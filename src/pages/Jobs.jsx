import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config";
import {
  LuMapPin,
  LuSearch,
  LuBriefcase,
  LuBuilding2,
  LuFilter,
  LuLoaderCircle,
  LuTriangleAlert,
  LuRefreshCw,
  LuChevronRight,
  LuClock3,
  LuBadgeIndianRupee,
  LuHouse,
} from "react-icons/lu";


export default function Jobs() {
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const PAGE_SIZE = 12;

  // Search params from URL (if user comes from homepage search)
  const initialTitle = searchParams.get("title") || "";
  const initialLocation = searchParams.get("location") || "";

  const [title, setTitle] = useState(initialTitle);
  const [location, setLocation] = useState(initialLocation);
  const [salary, setSalary] = useState("");
  const [type, setType] = useState("");
  const [workMode, setWorkMode] = useState("");

  useEffect(() => {
    loadJobs({
      title: initialTitle,
      location: initialLocation,
      minSalary: "",
      type: "",
      workMode: "",
    }, { page: 1, append: false });
  }, []);

  async function loadJobs(filters = {}, options = {}) {
    const nextPage = options.page || 1;
    const append = Boolean(options.append);

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setPageError("");

    try {
      const params = new URLSearchParams();

      if (filters.title?.trim()) params.append("title", filters.title.trim());
      if (filters.location?.trim()) params.append("location", filters.location.trim());
      if (filters.minSalary) params.append("minSalary", filters.minSalary);
      if (filters.type) params.append("type", filters.type);
      if (filters.workMode) params.append("workMode", filters.workMode);

      // Pagination
      params.append("page", String(nextPage));
      params.append("limit", String(PAGE_SIZE));

      const queryString = params.toString();
      const url = queryString
        ? `${API_BASE}/api/jobs?${queryString}`
        : `${API_BASE}/api/jobs`;

      const res = await fetch(url);

      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }

      if (!res.ok) {
        setPageError(data?.message || "Failed to load jobs");
        if (!append) {
          setJobs([]);
          setPage(1);
          setHasMore(false);
        }
        return;
      }

      // Backward compatibility: API may return array (old) or { jobs, hasMore, page }
      const incomingJobs = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
      const incomingHasMore = Array.isArray(data)
        ? incomingJobs.length === PAGE_SIZE
        : Boolean(data?.hasMore);
      const incomingPage = Array.isArray(data) ? nextPage : Number(data?.page) || nextPage;

      setJobs((prev) => (append ? [...prev, ...incomingJobs] : incomingJobs));
      setPage(incomingPage);
      setHasMore(incomingHasMore);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setPageError("Failed to load jobs");
      if (!append) {
        setJobs([]);
        setPage(1);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleSearch() {
    loadJobs({
      title,
      location,
      minSalary: salary,
      type,
      workMode,
    }, { page: 1, append: false });
  }

  function handleApplyFilters() {
    loadJobs({
      title,
      location,
      minSalary: salary,
      type,
      workMode,
    }, { page: 1, append: false });
  }

  function handleReset() {
    setTitle("");
    setLocation("");
    setSalary("");
    setType("");
    setWorkMode("");

    loadJobs({
      title: "",
      location: "",
      minSalary: "",
      type: "",
      workMode: "",
    }, { page: 1, append: false });
  }

  function handleLoadMore() {
    if (loadingMore || loading) return;
    loadJobs(
      {
        title,
        location,
        minSalary: salary,
        type,
        workMode,
      },
      { page: page + 1, append: true },
    );
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

  function getRequirementsPreview(job) {
    if (Array.isArray(job.requirements) && job.requirements.length > 0) {
      return job.requirements.slice(0, 3);
    }

    if (typeof job.requirements === "string" && job.requirements.trim()) {
      return job.requirements
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    return [];
  }

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (title.trim()) count++;
    if (location.trim()) count++;
    if (salary) count++;
    if (type) count++;
    if (workMode) count++;
    return count;
  }, [title, location, salary, type, workMode]);

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-6 sm:p-8 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-400/30 dark:bg-stone-900 dark:text-orange-300">
                  <LuBriefcase />
                  Explore Opportunities
                </div>

                <h1 className="mt-4 text-3xl font-black text-stone-900 sm:text-4xl">
                  Browse Jobs
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-stone-600 sm:text-base">
                  Search jobs by title, location, salary, type, and work mode — all in one clean dashboard.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Results
                </p>
                <p className="mt-1 text-2xl font-black text-stone-900">{jobs.length}</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="border-t border-stone-100 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr_auto]">
              <div className="relative">
                <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  placeholder="Search by job title (e.g. Frontend Developer)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="relative">
                <LuMapPin className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  placeholder="Location (e.g. Bengaluru, Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <LuSearch size={16} />
                Find Jobs
              </button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar Filters */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-orange-50 p-2 text-orange-600">
                    <LuFilter size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900">Filters</h2>
                    <p className="text-xs text-stone-500">{activeFilterCount} active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Job Type */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-stone-700">
                    Job Type
                  </label>

                  <div className="space-y-2">
                    {[
                      { value: "", label: "Any Type" },
                      { value: "Full-Time", label: "Full Time" },
                      { value: "Internship", label: "Internship" },
                      { value: "Part-Time", label: "Part Time" },
                    ].map((item) => (
                      <label
                        key={item.value || "any"}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1"
                      >
                        <input
                          type="radio"
                          name="jobType"
                          value={item.value}
                          checked={type === item.value}
                          onChange={(e) => setType(e.target.value)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span className="text-sm text-stone-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Min Salary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-700">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                {/* Work Mode */}
                <div>
                  <label className="mb-3 block text-sm font-semibold text-stone-700">
                    Work Mode
                  </label>

                  <div className="space-y-2">
                    {[
                      { value: "", label: "Any Mode" },
                      { value: "On-site", label: "On-site" },
                      { value: "Remote", label: "Remote" },
                      { value: "Hybrid", label: "Hybrid" },
                    ].map((item) => (
                      <label
                        key={item.value || "any"}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1"
                      >
                        <input
                          type="radio"
                          name="workMode"
                          value={item.value}
                          checked={workMode === item.value}
                          onChange={(e) => setWorkMode(e.target.value)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span className="text-sm text-stone-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleApplyFilters}
                    className="w-full rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                  >
                    Apply Filters
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
                  >
                    <LuRefreshCw size={16} />
                    Reset All
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section>
            {/* Loading */}
            {loading && (
              <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                  <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
                  <span className="text-sm font-semibold text-stone-700">Loading jobs...</span>
                </div>
              </div>
            )}

            {/* Error */}
            {!loading && pageError && (
              <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                    <LuTriangleAlert size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-900">Could not load jobs</h2>
                    <p className="mt-1 text-sm text-stone-600">{pageError}</p>
                    <button
                      onClick={handleSearch}
                      className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty */}
            {!loading && !pageError && jobs.length === 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500">
                  <LuBriefcase size={28} />
                </div>

                <h2 className="mt-5 text-2xl font-black text-stone-900">No jobs found</h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">
                  Try changing your search terms or clearing filters to see more opportunities.
                </p>

                <button
                  onClick={handleReset}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Reset filters
                  <LuChevronRight />
                </button>
              </div>
            )}

            {/* Results Header */}
            {!loading && !pageError && jobs.length > 0 && (
              <>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-stone-600">
                    <span className="font-bold text-stone-900">{jobs.length}</span>{" "}
                    {jobs.length === 1 ? "job found" : "jobs found"}
                  </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {jobs.map((job) => {
                    const requirementsPreview = getRequirementsPreview(job);

                    return (
                      <div
                        key={job._id}
                        className="group overflow-hidden rounded-3xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex h-full flex-col justify-between">
                          <div>
                            {/* Top badges */}
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                                {job.type || "Full-Time"}
                              </span>

                              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                                {getWorkMode(job)}
                              </span>

                              {job.isActive === false && (
                                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                  Closed
                                </span>
                              )}
                            </div>

                            <h2 className="line-clamp-2 text-xl font-black text-stone-900 transition group-hover:text-orange-600">
                              {job.title || "Untitled Job"}
                            </h2>

                            <div className="mt-3 space-y-2 text-sm text-stone-600">
                              <div className="flex items-center gap-2">
                                <HiCompanyIcon />
                                <span className="font-medium">
                                  {job.company || "Unknown Company"}
                                </span>
                              </div>

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

                            {/* Description preview */}
                            {job.description && (
                              <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-500">
                                {job.description}
                              </p>
                            )}

                            {/* Skills preview */}
                            {requirementsPreview.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {requirementsPreview.map((req, index) => (
                                  <span
                                    key={`${job._id}-${req}-${index}`}
                                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600"
                                  >
                                    {req}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Footer meta */}
                            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-stone-400">
                              {job.createdAt && (
                                <div className="flex items-center gap-1.5">
                                  <LuClock3 size={14} />
                                  Posted{" "}
                                  {new Date(job.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <Link
                            to={`/jobs/${job._id}`}
                            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-bold text-stone-800 transition hover:bg-orange-500 hover:text-white dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-orange-500 dark:hover:text-white"
                          >
                            View Details
                            <LuChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load more */}
                {hasMore && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <LuLoaderCircle className="animate-spin" size={16} />
                          Loading...
                        </>
                      ) : (
                        "Load more"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function HiCompanyIcon() {
  return <LuBuilding2 className="text-stone-400" />;
}