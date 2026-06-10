import React from "react";
import { Link, useParams } from "react-router-dom";
import { API_BASE } from "../config";
import { useEffect, useState } from "react";
import ResumePreview from "../components/ResumePreview.jsx";
import { getCookie } from "../utils/cookies";

export default function ResumePreviewPage() {
  const { resumeId } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const role = getCookie("role");
  const isCandidateView = role === "candidate";

  useEffect(() => {
    fetchResume();
  }, [resumeId]);

  async function fetchResume() {
    try {
      // Uses the secure route; authorization comes from the httpOnly cookie
      const res = await fetch(`${API_BASE}/api/applications/resume/${resumeId}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Could not load resume.");
        return;
      }

      const data = await res.json();
      setResumeData(data);
    } catch {
      setError("Failed to load resume. Please try again.");
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));
  const handleZoomReset = () => setZoom(100);

  const context = resumeData?.context;
  const candidateName =
    context?.candidate?.name || resumeData?.data?.name || "Candidate";
  const candidateEmail =
    context?.candidate?.email || resumeData?.data?.email || "";
  const job = context?.job;
  const application = context?.application;
  const jobIdForLinks = job?.id || job?._id;

  function formatDateTime(value) {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  }

  function getStatusMeta(status) {
    const normalized = typeof status === "string" ? status.toLowerCase() : "";
    switch (normalized) {
      case "accepted":
        return {
          label: "Accepted",
          className:
            "border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200",
        };
      case "rejected":
        return {
          label: "Rejected",
          className:
            "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
        };
      default:
        return {
          label: "Pending",
          className:
            "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
        };
    }
  }

  const statusMeta = getStatusMeta(context?.application?.status);

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-12 dark:bg-stone-950">
        <div className="mx-auto max-w-xl rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-bold uppercase tracking-wide text-red-600 dark:text-red-400">
            Access denied
          </p>
          <h1 className="mt-2 text-xl font-extrabold text-stone-900 dark:text-stone-50">
            Unable to load this resume
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{error}</p>
          <div className="mt-5">
            <Link
              to={isCandidateView ? "/my-applications" : "/employer-dashboard"}
              className={
                isCandidateView
                  ? "inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                  : "inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
              }
            >
              {isCandidateView ? "Back to My Applications" : "Back to Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 dark:bg-stone-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {isCandidateView ? "Application Resume" : "Employer Resume View"}
              </p>
              <h1 className="mt-1 truncate text-xl font-extrabold text-stone-900 dark:text-stone-50">
                {isCandidateView ? (resumeData?.title || "Resume") : candidateName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {context?.application?.status && (
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                )}

                {job?.title && (
                  <span className="inline-flex items-center rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
                    {job.title}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {jobIdForLinks && !isCandidateView && (
                <Link
                  to={`/employer-dashboard/applicants/${jobIdForLinks}`}
                  className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
                >
                  Back to Applicants
                </Link>
              )}

              {isCandidateView && (
                <Link
                  to="/my-applications"
                  className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                >
                  Back to My Applications
                </Link>
              )}

              {isCandidateView && jobIdForLinks && (
                <Link
                  to={`/jobs/${jobIdForLinks}`}
                  className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                >
                  View Job
                </Link>
              )}

              {!isCandidateView && (
                <Link
                  to="/employer-dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                {isCandidateView ? "Application details" : "Details"}
              </h2>

              <div className="mt-4 space-y-4">
                {!isCandidateView && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      Candidate
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-900 dark:text-stone-50">
                      {candidateName}
                    </p>
                    {candidateEmail ? (
                      <p className="mt-1 break-all text-sm text-stone-600 dark:text-stone-300">
                        {candidateEmail}
                      </p>
                    ) : null}
                  </div>
                )}

                {application ? (
                  <div>
                    <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      Application
                    </p>

                    <div className="mt-2 grid gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950">
                      {application.status ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Status</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-50">
                            {statusMeta.label}
                          </span>
                        </div>
                      ) : null}

                      {application.createdAt ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Applied</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-50">
                            {formatDateTime(application.createdAt)}
                          </span>
                        </div>
                      ) : null}

                      {!isCandidateView && application.reviewedAt ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Reviewed</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-50">
                            {formatDateTime(application.reviewedAt)}
                          </span>
                        </div>
                      ) : null}

                      {!application.status && !application.createdAt && (!application.reviewedAt || isCandidateView) ? (
                        <div className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                          Application details unavailable.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {job ? (
                  <div>
                    <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      Job
                    </p>
                    <div className="mt-2 grid gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950">
                      {job.title ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Title</span>
                          <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                            {job.title}
                          </span>
                        </div>
                      ) : null}

                      {job.company ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Company</span>
                          <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                            {job.company}
                          </span>
                        </div>
                      ) : null}

                      {job.location ? (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Location</span>
                          <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                            {job.location}
                          </span>
                        </div>
                      ) : null}

                      {(job.type || job.workMode) && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-stone-500 dark:text-stone-400">Type</span>
                          <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                            {[job.type, job.workMode].filter(Boolean).join(" • ")}
                          </span>
                        </div>
                      )}

                      {!job.title && !job.company && !job.location && !job.type && !job.workMode ? (
                        <div className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                          Job details unavailable.
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                    Resume
                  </p>
                  <div className="mt-2 grid gap-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-stone-800 dark:bg-stone-950">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-stone-500 dark:text-stone-400">Title</span>
                      <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                        {resumeData?.title || "Untitled Resume"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-stone-500 dark:text-stone-400">Created</span>
                      <span className="text-right font-semibold text-stone-900 dark:text-stone-50">
                        {formatDateTime(resumeData?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCandidateView &&
                typeof context?.application?.employerNotes === "string" &&
                context.application.employerNotes.trim() ? (
                  <div>
                    <p className="text-xs font-bold text-stone-500 dark:text-stone-400">
                      Notes
                    </p>
                    <div className="mt-2 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
                      {context.application.employerNotes}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8">
            <div className="rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <div className="sticky top-[72px] z-10 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
                <p className="text-sm font-bold text-stone-700 dark:text-stone-200">
                  Resume Preview
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
                  >
                    -
                  </button>
                  <span className="min-w-[64px] text-center text-sm font-bold text-stone-700 dark:text-stone-200">
                    {zoom}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-900"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomReset}
                    className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                  >
                    Reset
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto p-4 sm:p-6">
                {resumeData ? (
                  <div
                    className="mx-auto w-fit rounded-2xl bg-white p-2 shadow-2xl"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "top center",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <div className="p-4 sm:p-6 lg:p-8">
                      <ResumePreview formData={resumeData.data} />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-10 text-center dark:border-stone-800 dark:bg-stone-950">
                    <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                      Loading resume…
                    </p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

