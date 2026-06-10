import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import {
  LuBuilding2,
  LuMapPin,
  LuGlobe,
  LuBriefcase,
  LuUsers,
  LuBadgeCheck,
  LuArrowLeft,
  LuLoaderCircle,
  LuTriangleAlert,
  LuRefreshCw,
  LuShield,
} from "react-icons/lu";

export default function CompanyProfileView() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadCompanyProfile();
  }, [companyId]);

  async function loadCompanyProfile() {
    setLoading(true);
    setPageError("");

    try {
      // Fetch company details by ID
      const companyRes = await fetch(`${API_BASE}/api/users/${companyId}`);

      let companyData;
      try {
        companyData = await companyRes.json();
      } catch {
        companyData = null;
      }

      if (!companyRes.ok || !companyData) {
        setPageError("Company not found");
        setCompany(null);
        setJobs([]);
        return;
      }

      setCompany(companyData);

      // Fetch jobs from this company
      const jobsRes = await fetch(`${API_BASE}/api/jobs?employerId=${companyId}`);

      let jobsData = [];
      try {
        jobsData = await jobsRes.json();
      } catch {
        jobsData = [];
      }

      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (err) {
      console.error("Failed to load company profile:", err);
      setPageError("Failed to load company information");
      setCompany(null);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  const companySizeLabel = {
    "1-10": "1-10 employees",
    "11-50": "11-50 employees",
    "51-200": "51-200 employees",
    "200+": "200+ employees",
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:hover:bg-orange-500/10"
        >
          <LuArrowLeft size={18} />
          Back
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
              <span className="text-sm font-semibold text-stone-700">
                Loading company profile...
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
                <h2 className="text-xl font-bold text-stone-900">Unable to load profile</h2>
                <p className="mt-2 text-sm text-stone-600">{pageError}</p>
                <button
                  onClick={loadCompanyProfile}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <LuRefreshCw size={16} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !pageError && company && (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-orange-400 to-orange-600 p-8">
                <div className="flex items-start gap-6">
                  <div className="rounded-2xl border-4 border-white bg-orange-100 p-6 text-orange-600">
                    <LuBuilding2 size={48} />
                  </div>

                  <div className="flex-1 text-white">
                    <div className="flex items-center gap-3">
                      <h1 className="text-4xl font-black">
                        {company.companyName || "Company"}
                      </h1>

                      {company.isVerified && (
                        <div className="flex items-center gap-1 rounded-full border border-white/30 bg-white/20 px-3 py-1 backdrop-blur">
                          <LuBadgeCheck size={18} />
                          <span className="text-sm font-semibold">Verified</span>
                        </div>
                      )}
                    </div>

                    {company.industry && (
                      <p className="mt-2 text-lg opacity-90">{company.industry}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      {company.companyCity && (
                        <div className="flex items-center gap-2">
                          <LuMapPin size={16} />
                          <span>{company.companyCity}</span>
                        </div>
                      )}

                      {company.companySize && (
                        <div className="flex items-center gap-2">
                          <LuUsers size={16} />
                          <span>
                            {companySizeLabel[company.companySize] || company.companySize}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info Grid */}
              <div className="grid grid-cols-1 gap-6 border-t border-stone-200 p-8 sm:grid-cols-2 lg:grid-cols-4">
                {/* Website */}
                {company.companyWebsite && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                      <LuGlobe size={16} />
                      Website
                    </div>
                    <a
                      href={
                        company.companyWebsite.startsWith("http")
                          ? company.companyWebsite
                          : `https://${company.companyWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block truncate text-sm font-medium text-orange-600 transition hover:text-orange-700 hover:underline"
                    >
                      {company.companyWebsite}
                    </a>
                  </div>
                )}

                {/* Company Size */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <LuUsers size={16} />
                    Company Size
                  </div>
                  <p className="mt-2 text-sm font-medium text-stone-900">
                    {company.companySize
                      ? companySizeLabel[company.companySize] || company.companySize
                      : "Not specified"}
                  </p>
                </div>

                {/* Industry */}
                {company.industry && (
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                      <LuBriefcase size={16} />
                      Industry
                    </div>
                    <p className="mt-2 text-sm font-medium text-stone-900">
                      {company.industry}
                    </p>
                  </div>
                )}

                {/* Verification Status */}
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-600">
                    <LuShield size={16} />
                    Verification
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                        company.isVerified
                          ? "border border-green-200 bg-green-50 text-green-700"
                          : "border border-stone-200 bg-stone-50 text-stone-700"
                      }`}
                    >
                      {company.isVerified ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {company.companyDescription && (
              <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900">About Company</h2>
                <p className="mt-4 whitespace-pre-wrap text-stone-700">
                  {company.companyDescription}
                </p>
              </div>
            )}

            {/* Hiring For Section */}
            {company.hiringFor && company.hiringFor.length > 0 && (
              <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-stone-900">Currently Hiring For</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {company.hiringFor.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Open Positions Section */}
            <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 pb-6">
                <h2 className="text-2xl font-bold text-stone-900">Open Positions</h2>
                <span className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-600">
                  {jobs.length} {jobs.length === 1 ? "job" : "jobs"}
                </span>
              </div>

              {jobs.length === 0 ? (
                <div className="py-8 text-center">
                  <LuBriefcase className="mx-auto mb-3 text-stone-400" size={32} />
                  <p className="text-stone-600">No open positions at the moment</p>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {jobs.map((job) => (
                    <a
                      key={job._id}
                      href={`/jobs/${job._id}`}
                      className="block rounded-2xl border border-stone-200 p-4 transition hover:border-orange-200 hover:bg-orange-50 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-stone-900">{job.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-600">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <LuMapPin size={14} />
                                {job.location}
                              </div>
                            )}

                            {job.type && (
                              <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                {job.type}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-bold text-orange-600">View →</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}