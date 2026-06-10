import { useEffect, useState } from "react";
import { API_BASE } from "../../config";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchReports() {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (status) query.append("status", status);

      const res = await fetch(`${API_BASE}/api/admin/reports?${query.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to fetch reports");
        return;
      }

      setReports(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  }

  async function updateReport(id, payload) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update report");
        return;
      }

      fetchReports();
    } catch {
      alert("Failed to update report");
    }
  }

  async function updateJob(jobId, payload) {
    try {
      const res = await fetch(`${API_BASE}/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update job");
        return;
      }

      fetchReports();
    } catch {
      alert("Failed to update job");
    }
  }

  function badgeColor(value) {
    if (value === "open")
      return "bg-red-50 text-red-700 border border-red-200 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200";
    if (value === "reviewed")
      return "bg-amber-50 text-amber-800 border border-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200";
    if (value === "resolved")
      return "bg-green-50 text-green-700 border border-green-200 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200";
    return "bg-stone-100 text-stone-700 border border-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200";
  }

  function formatDate(date) {
    if (!date) return "N/A";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "N/A";
    return d.toLocaleString();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h1 className="text-3xl font-black text-stone-900 dark:text-stone-50">Job Reports</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-300">
          Review reports submitted by candidates and take action.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-50 dark:focus:border-orange-400 dark:focus:ring-orange-500/20"
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={fetchReports}
            className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-500/30"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading && (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center text-stone-600 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
            Loading reports...
          </div>
        )}

        {!loading && reports.map((r) => (
          <div
            key={r._id}
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black text-stone-900 dark:text-stone-50">
                    {r.jobId?.title || "Deleted Job"}
                  </h2>

                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeColor(r.status)}`}>
                    {(r.status || "open").toUpperCase()}
                  </span>
                </div>

                <p className="mt-2 text-sm text-stone-500 dark:text-stone-300">
                  {(r.jobId?.company || "Unknown Company")} • {(r.jobId?.location || "Unknown Location")}
                </p>

                {r.jobId && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.jobId.approvalStatus && (
                      <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
                        {String(r.jobId.approvalStatus).toUpperCase()}
                      </span>
                    )}
                    {r.jobId.isFeatured ? (
                      <span className="rounded-full border border-yellow-200 bg-yellow-50 px-3 py-1 text-xs font-bold text-yellow-700 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200">
                        FEATURED
                      </span>
                    ) : null}
                    {r.jobId.isFlagged ? (
                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
                        FLAGGED
                      </span>
                    ) : null}
                    {r.jobId.status && r.jobId.status !== "active" ? (
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200">
                        {String(r.jobId.status).toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-stone-600 dark:text-stone-300 sm:grid-cols-2">
                  <p>
                    Reporter: <span className="font-semibold">{r.reporterId?.name || r.reporterName || "Unknown"}</span>
                  </p>
                  <p className="break-all">
                    Email: <span className="font-semibold">{r.reporterId?.email || r.reporterEmail || "N/A"}</span>
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
                    Reason
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-stone-700 dark:text-stone-200">
                    {r.reason}
                  </p>
                </div>

                <p className="mt-3 text-xs text-stone-400 dark:text-stone-500">
                  Reported: {formatDate(r.createdAt)}
                  {r.resolvedAt ? ` • Resolved: ${formatDate(r.resolvedAt)}` : ""}
                </p>

                {r.jobId?._id && (
                  <a
                    href={`/jobs/${r.jobId._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-orange-700 hover:underline dark:text-orange-200"
                  >
                    Open job
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2 xl:max-w-[420px]">
                {r.jobId?._id && (
                  <>
                    <button
                      onClick={() =>
                        updateJob(r.jobId._id, { isFlagged: !Boolean(r.jobId.isFlagged) })
                      }
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                    >
                      {r.jobId.isFlagged ? "Unflag job" : "Flag job"}
                    </button>

                    <button
                      onClick={() =>
                        updateJob(r.jobId._id, { isActive: !Boolean(r.jobId.isActive) })
                      }
                      className="rounded-2xl border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      {r.jobId.isActive === false ? "Activate job" : "Deactivate job"}
                    </button>
                  </>
                )}

                {r.status !== "reviewed" && r.status !== "resolved" && (
                  <button
                    onClick={() => updateReport(r._id, { status: "reviewed" })}
                    className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-800 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                  >
                    Mark Reviewed
                  </button>
                )}

                {r.status !== "resolved" && (
                  <button
                    onClick={() => updateReport(r._id, { status: "resolved" })}
                    className="rounded-2xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 transition hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200 dark:hover:bg-green-500/20"
                  >
                    Resolve
                  </button>
                )}

                {r.status === "resolved" && (
                  <button
                    onClick={() => updateReport(r._id, { status: "open" })}
                    className="rounded-2xl border border-stone-200 bg-stone-100 px-4 py-2 text-sm font-bold text-stone-700 transition hover:bg-stone-200 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {!loading && reports.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-10 text-center text-stone-500 shadow-sm dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
}
