import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import { Link } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import {
  LuBriefcase,
  LuSearch,
  LuFileText,
  LuMapPin,
  LuBuilding2,
  LuCalendarDays,
  LuCheck,
  LuTriangleAlert,
  LuClock3,
  LuX,
  LuEye,
  LuLoaderCircle,
  LuFilter,
  LuChevronRight,
} from "react-icons/lu";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const name = getCookie("name") || "Candidate";

  useEffect(() => {
    fetchApplications();
  }, []);

  function showToast(message, type = "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchApplications() {
    setLoading(true);
    setPageError("");

    try {
      const res = await fetch(`${API_BASE}/api/applications/my`, {
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }

      if (!res.ok) {
        const message = data?.message || "Failed to load applications";
        setPageError(message);
        showToast(message, "error");
        setApplications([]);
        return;
      }

      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load applications:", error);
      setPageError("Failed to load applications");
      showToast("Failed to load applications", "error");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  function getStatusMeta(status) {
    const normalized = (status || "pending").toLowerCase();

    if (normalized === "accepted") {
      return {
        label: "Accepted",
        badge:
          "bg-green-50 text-green-700 border-green-200 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200",
        dot: "bg-green-500",
        icon: <LuCheck size={16} />,
      };
    }

    if (normalized === "rejected") {
      return {
        label: "Rejected",
        badge:
          "bg-red-50 text-red-700 border-red-200 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
        dot: "bg-red-500",
        icon: <LuX size={16} />,
      };
    }

    return {
      label: "Pending",
      badge:
        "bg-amber-50 text-amber-700 border-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
      dot: "bg-amber-500",
      icon: <LuClock3 size={16} />,
    };
  }

  function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getAppliedRelative(date) {
    if (!date) return "Recently applied";

    const applied = new Date(date);
    const now = new Date();
    const diffMs = now - applied;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Applied today";
    if (diffDays === 1) return "Applied 1 day ago";
    if (diffDays < 30) return `Applied ${diffDays} days ago`;

    return `Applied on ${formatDate(date)}`;
  }

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((a) => a.status === "pending").length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;

    return { total, pending, accepted, rejected };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    let result = [...applications];

    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((app) => {
        const title = app.jobId?.title?.toLowerCase() || "";
        const company = app.jobId?.company?.toLowerCase() || "";
        const location = app.jobId?.location?.toLowerCase() || "";
        const resumeTitle = app.resumeId?.title?.toLowerCase() || "";

        return (
          title.includes(q) ||
          company.includes(q) ||
          location.includes(q) ||
          resumeTitle.includes(q)
        );
      });
    }

    return result;
  }, [applications, search, statusFilter]);

  function renderTimeline(statusValue) {
    const normalized = (statusValue || "pending").toLowerCase();
    const isAccepted = normalized === "accepted";
    const isRejected = normalized === "rejected";
    const outcomeLabel = isAccepted
      ? "Accepted"
      : isRejected
        ? "Rejected"
        : "Accepted / Rejected";

    const progressPercent = isAccepted || isRejected ? 100 : 50;

    return (
      <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          Timeline
        </p>

        <div className="relative mt-4">
          {/* Track */}
          <div className="absolute left-0 right-0 top-[10px] h-1 rounded-full bg-stone-200 dark:bg-stone-800" />
          {/* Progress */}
          <div
            className="absolute left-0 top-[10px] h-1 rounded-full bg-orange-500"
            style={{ width: `${progressPercent}%` }}
          />

          <div className="relative flex items-start justify-between">
            {/* Applied */}
            <div className="flex flex-col items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 ring-4 ring-stone-50 dark:ring-stone-950">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <p className="mt-2 text-sm font-semibold text-orange-600 dark:text-orange-300">
                Applied
              </p>
            </div>

            {/* Pending */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-stone-50 dark:ring-stone-950 ${
                  isAccepted || isRejected
                    ? "bg-orange-500"
                    : "bg-orange-500"
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <p
                className={`mt-2 text-sm font-semibold ${
                  isAccepted || isRejected
                    ? "text-orange-600 dark:text-orange-300"
                    : "text-orange-600 dark:text-orange-300"
                }`}
              >
                Pending
              </p>
            </div>

            {/* Outcome */}
            <div className="flex flex-col items-end">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-stone-50 dark:ring-stone-950 ${
                  isAccepted
                    ? "bg-green-500"
                    : isRejected
                      ? "bg-red-500"
                      : "bg-stone-300 dark:bg-stone-700"
                }`}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
              <p
                className={`mt-2 text-sm font-semibold ${
                  isAccepted
                    ? "text-green-700 dark:text-green-200"
                    : isRejected
                      ? "text-red-700 dark:text-red-200"
                      : "text-stone-400 dark:text-stone-500"
                }`}
              >
                {outcomeLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`min-w-[260px] rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-200 bg-white text-green-700 dark:border-green-500/30 dark:bg-stone-900 dark:text-green-200"
                : "border-red-200 bg-white text-red-700 dark:border-red-500/30 dark:bg-stone-900 dark:text-red-200"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {toast.type === "success" ? <LuCheck /> : <LuTriangleAlert />}
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 p-6 sm:p-8 dark:from-stone-950 dark:via-stone-950 dark:to-stone-900">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-400/30 dark:bg-stone-900 dark:text-orange-300">
                  <LuBriefcase />
                  Candidate Dashboard
                </div>

                <h1 className="mt-4 text-2xl font-black text-stone-900 sm:text-3xl dark:text-stone-50">
                  My Applications
                </h1>

                <p className="mt-2 text-sm text-stone-600 sm:text-base dark:text-stone-300">
                  Track your applied jobs, resume usage, and application status — all in one place.
                </p>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                  Welcome back
                </p>
                <p className="mt-1 text-lg font-extrabold text-stone-900 dark:text-stone-50">{name}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Applications",
                value: stats.total,
                icon: <LuBriefcase className="text-orange-500" />,
                bg: "bg-orange-50 dark:bg-orange-500/10",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: <LuClock3 className="text-amber-500" />,
                bg: "bg-amber-50 dark:bg-amber-500/10",
              },
              {
                label: "Accepted",
                value: stats.accepted,
                icon: <LuCheck className="text-green-500" />,
                bg: "bg-green-50 dark:bg-green-500/10",
              },
              {
                label: "Rejected",
                value: stats.rejected,
                icon: <LuX className="text-red-500" />,
                bg: "bg-red-50 dark:bg-red-500/10",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-black text-stone-900 dark:text-stone-50">{card.value}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.bg}`}>{card.icon}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters */}
        <section className="mt-6 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search by title, company, location, or resume..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:ring-orange-500/20"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="mr-1 inline-flex items-center gap-2 text-sm font-semibold text-stone-500">
                <LuFilter size={16} />
                Status
              </div>

              {[
                { key: "all", label: "All" },
                { key: "pending", label: "Pending" },
                { key: "accepted", label: "Accepted" },
                { key: "rejected", label: "Rejected" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setStatusFilter(item.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    statusFilter === item.key
                      ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300"
                      : "border-stone-200 bg-white text-stone-600 hover:border-orange-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-orange-500/40"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Loading */}
        {loading && (
          <div className="mt-6 flex min-h-[300px] items-center justify-center rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-950">
              <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                Loading your applications...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && pageError && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-500/30 dark:bg-stone-900">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-200">
                <LuTriangleAlert size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-50">Could not load applications</h2>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">{pageError}</p>
                <button
                  onClick={fetchApplications}
                  className="mt-4 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !pageError && applications.length === 0 && (
          <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-10 dark:border-stone-800 dark:bg-stone-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-300">
              <LuBriefcase size={28} />
            </div>

            <h2 className="mt-5 text-2xl font-black text-stone-900 dark:text-stone-50">
              No applications yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500 dark:text-stone-400">
              You haven’t applied to any jobs yet. Start exploring jobs and track your applications here.
            </p>

            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Browse jobs
              <LuChevronRight />
            </Link>
          </div>
        )}

        {/* Filtered empty state */}
        {!loading &&
          !pageError &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-300">
                <LuSearch size={24} />
              </div>
              <h2 className="mt-4 text-xl font-black text-stone-900 dark:text-stone-50">No matching results</h2>
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
                Try changing your search or status filter.
              </p>
            </div>
          )}

        {/* Applications list */}
        {!loading && !pageError && filteredApplications.length > 0 && (
          <div className="mt-6 space-y-4">
            {filteredApplications.map((app) => {
              const status = getStatusMeta(app.status);

              return (
                <div
                  key={app._id}
                  className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
                >
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left */}
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
                          >
                            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>

                        <h2 className="truncate text-xl font-black text-stone-900 sm:text-2xl dark:text-stone-50">
                          {app.jobId?.title || "Untitled Job"}
                        </h2>

                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-600 dark:text-stone-300">
                          <div className="flex items-center gap-2">
                            <LuBuilding2 className="text-stone-400" />
                            <span className="font-medium">
                              {app.jobId?.company || "Unknown Company"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <LuMapPin className="text-stone-400" />
                            <span>{app.jobId?.location || "Unknown Location"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <LuCalendarDays className="text-stone-400" />
                            <span>{getAppliedRelative(app.createdAt)}</span>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Applied On
                            </p>
                            <p className="mt-1 text-sm font-bold text-stone-800 dark:text-stone-100">
                              {formatDate(app.createdAt)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                              Resume Used
                            </p>
                            <p className="mt-1 truncate text-sm font-bold text-stone-800 dark:text-stone-100">
                              {app.resumeId?.title || "Untitled Resume"}
                            </p>
                          </div>
                        </div>

                        {renderTimeline(app.status)}
                      </div>

                      {/* Right */}
                      <div className="w-full shrink-0 space-y-3 lg:w-[220px]">
                        <Link
                          to={`/resume/${app.resumeId?._id}`}
                          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
                        >
                          <LuFileText size={16} />
                          View Resume
                        </Link>

                        {app.jobId?._id && (
                          <Link
                            to={`/jobs/${app.jobId._id}`}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                          >
                            <LuEye size={16} />
                            View Job
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}