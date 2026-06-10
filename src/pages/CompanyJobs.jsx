import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
  LuMapPin,
  LuBuilding2,
  LuBriefcase,
  LuLoaderCircle,
  LuTriangleAlert,
  LuRefreshCw,
  LuChevronRight,
  LuClock3,
  LuBadgeIndianRupee,
  LuHouse,
  LuArrowLeft,
} from "react-icons/lu";

export default function CompanyJobs() {
  const { companyName } = useParams();
  const navigate = useNavigate();
  const decodedCompanyName = decodeURIComponent(companyName);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadCompanyJobs();
  }, [companyName]);

  async function loadCompanyJobs() {
    setLoading(true);
    setPageError("");

    try {
      const params = new URLSearchParams();
      params.append("company", decodedCompanyName);

      const url = `${API_BASE}/api/jobs?company=${encodeURIComponent(decodedCompanyName)}`;

      const res = await fetch(url);

      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }

      if (!res.ok) {
        setPageError(data?.message || "Failed to load company jobs");
        setJobs([]);
        return;
      }

      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load company jobs:", err);
      setPageError("Failed to load company jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  function formatSalary(minSalary, maxSalary) {
    if (!minSalary && !maxSalary) return "Salary not disclosed";
    if (minSalary && maxSalary) return `₹${minSalary.toLocaleString()} - ₹${maxSalary.toLocaleString()}`;
    return `₹${(minSalary || maxSalary).toLocaleString()}`;
  }

  function getWorkMode(job) {
    if (job.workMode) return job.workMode;
    return job.remote ? "Remote" : "On-site";
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
        >
          <LuArrowLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 p-4 text-white">
              <LuBuilding2 size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-stone-900">{decodedCompanyName}</h1>
              <p className="mt-2 text-stone-600">
                {jobs.length} active {jobs.length === 1 ? "job opening" : "job openings"}
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
              <span className="text-sm font-semibold text-stone-700">
                Loading company jobs...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && pageError && (
          <div className="rounded-3xl border border-red-200 bg-white p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <LuTriangleAlert size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Unable to load jobs</h2>
                <p className="mt-2 text-sm text-stone-600">{pageError}</p>
                <button
                  onClick={loadCompanyJobs}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <LuRefreshCw size={16} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No jobs found */}
        {!loading && !pageError && jobs.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
              <LuBriefcase className="text-stone-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">No jobs found</h2>
            <p className="mt-2 text-stone-600">This company is not currently hiring.</p>
          </div>
        )}

        {/* Jobs grid */}
        {!loading && !pageError && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-orange-200 hover:shadow-lg"
              >
                <div className="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                          {job.type || "Full-Time"}
                        </span>

                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {getWorkMode(job)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-stone-900">
                        <a
                          href={`/jobs/${job._id}`}
                          className="transition hover:text-orange-600"
                        >
                          {job.title}
                        </a>
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-600">
                        {job.location && (
                          <div className="flex items-center gap-2">
                            <LuMapPin className="text-stone-400" size={16} />
                            <span>{job.location}</span>
                          </div>
                        )}

                        {(job.salaryMin || job.salaryMax || job.salary) && (
                          <div className="flex items-center gap-2">
                            <LuBadgeIndianRupee className="text-stone-400" size={16} />
                            <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          </div>
                        )}

                        {job.experience && (
                          <div className="flex items-center gap-2">
                            <LuClock3 className="text-stone-400" size={16} />
                            <span>{job.experience}</span>
                          </div>
                        )}
                      </div>

                      {job.description && (
                        <p className="mt-3 line-clamp-2 text-sm text-stone-600">
                          {job.description}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <a
                        href={`/jobs/${job._id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                      >
                        View Job
                        <LuChevronRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
