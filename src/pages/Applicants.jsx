import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import { useParams, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookies";
import {
  LuUsers,
  LuMapPin,
  LuCalendarDays,
  LuBriefcase,
  LuIndianRupee,
  LuSearch,
  LuX,
  LuFileText,
  LuCheck,
  LuCircleAlert,
  LuCircleX,
} from "react-icons/lu";

export default function Applicants() {
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const userId = getCookie("userId");
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    if (jobId) {
      loadApplicants(jobId);
    }
  }, [jobId]);

  async function loadApplicants(jobId) {
    try {
      setLoading(true);
      setSelectedJob(jobId);
      await loadJobDetails(jobId);

      const res = await fetch(
        `${API_BASE}/api/applications/job/${jobId}/applicants`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading applicants:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(appId, status) {
    try {
      await fetch(`${API_BASE}/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      await loadApplicants(selectedJob);

      // keep drawer data in sync
      const updated = applications.find((a) => a._id === appId);
      if (updated && selectedApplicant?._id === appId) {
        setSelectedApplicant({ ...updated, status });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  }

  async function loadJobDetails(jobId) {
    try {
      if (!userId) return;
      const res = await fetch(`${API_BASE}/api/jobs/employer/${userId}/job/${jobId}`, {
        credentials: "include",
      });
      const job = await res.json();
      setJobDetails(job);
    } catch (error) {
      console.error("Error loading job details:", error);
    }
  }

 


  const statusCounts = useMemo(() => {
    const counts = {
      total: applications.length,
      new: 0,
      accepted: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      if (app.status === "pending") counts.new += 1;
      if (app.status === "accepted") counts.accepted += 1;
      if (app.status === "rejected") counts.rejected += 1;
    });

    return counts;
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const name = app.applicantId?.name?.toLowerCase() || "";
      const email = app.applicantId?.email?.toLowerCase() || "";
      const query = searchTerm.toLowerCase();

      const matchesSearch =
        name.includes(query) ||
        email.includes(query);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "new"
          ? app.status === "pending"
          : app.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  const displayedApplicant = useMemo(() => {
    if (!selectedApplicant) return null;
    return (
      applications.find((app) => app._id === selectedApplicant._id) ||
      selectedApplicant
    );
  }, [applications, selectedApplicant]);

  function getStatusMeta(status) {
    switch (status) {
      case "accepted":
        return {
          label: "Accepted",
          className:
            "bg-green-50 text-green-700 border border-green-200 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200",
          icon: <LuCheck className="text-sm" />,
        };
      case "rejected":
        return {
          label: "Rejected",
          className:
            "bg-red-50 text-red-700 border border-red-200 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
          icon: <LuCircleX className="text-sm" />,
        };
      case "pending":
      default:
        return {
          label: "Pending",
          className:
            "bg-amber-50 text-amber-700 border border-amber-200 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
          icon: <LuCircleAlert className="text-sm" />,
        };
    }
  }

  function getApplicantInitials(name) {
    if (!name) return "A";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "A";
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }

  function getAvatarColors(index) {
    const palettes = [
      "bg-blue-100 text-blue-700",
      "bg-orange-100 text-orange-700",
      "bg-green-100 text-green-700",
      "bg-purple-100 text-purple-700",
      "bg-pink-100 text-pink-700",
      "bg-amber-100 text-amber-700",
    ];
    return palettes[index % palettes.length];
  }

  function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  }

  function formatSalary(salary) {
    if (!salary && salary !== 0) return "N/A";
    return `${salary}`;
  }

  function openDrawer(app) {
    setSelectedApplicant(app);
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    setSelectedApplicant(null);
    document.body.style.overflow = "auto";
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-5 flex flex-wrap items-center gap-1 text-xs font-medium text-stone-500 sm:text-sm dark:text-stone-400">
          <span className="text-orange-600">Dashboard</span>
          <span>›</span>
          <span className="text-orange-600">Job Listings</span>
          <span>›</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200">
            {jobDetails?.title || "Loading..."} Applicants
          </span>
        </div>

        {/* Job Header */}
        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-blue-100 text-xl sm:text-2xl font-bold text-blue-700 shrink-0">
                {jobDetails?.title ? jobDetails.title[0].toUpperCase() : "J"}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="break-words text-xl font-extrabold text-stone-900 sm:text-2xl dark:text-stone-50">
                  {jobDetails?.title || "Loading..."}
                </h1>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-stone-600 sm:text-sm dark:text-stone-300">
                  <div className="flex items-center gap-1.5">
                    <LuMapPin className="text-sm" />
                    <span className="capitalize">
                      {jobDetails?.location || "N/A"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <LuBriefcase className="text-sm" />
                    <span className="capitalize">{jobDetails?.type || "N/A"}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <LuCalendarDays className="text-sm" />
                    <span>Posted {formatDate(jobDetails?.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <LuCalendarDays className="text-sm" />
                    <span>Closes {formatDate(jobDetails?.closingDate)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                    <LuIndianRupee className="text-sm" />
                    <span>{formatSalary(jobDetails?.salaryMin)}-{formatSalary(jobDetails?.salaryMax)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-semibold text-stone-800 dark:text-stone-200">
                    <span>{jobDetails?.salaryPeriod}</span>
                  </div>
                </div>

                {!!jobDetails?.requirements?.length && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {jobDetails.requirements.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {jobDetails.requirements.length > 5 && (
                      <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300">
                        +{jobDetails.requirements.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {/* Additional Job Details */}
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {jobDetails?.workMode && (
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                      <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">Work Mode</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        {jobDetails.workMode}
                      </p>
                    </div>
                  )}

                  {jobDetails?.experience && (
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                      <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">Experience</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        {jobDetails.experience}
                      </p>
                    </div>
                  )}

                  {jobDetails?.category && (
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                      <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">Category</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        {jobDetails.category}
                      </p>
                    </div>
                  )}

                  {jobDetails?.vacancies && (
                    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800">
                      <p className="mb-1 text-xs font-semibold text-stone-500 dark:text-stone-400">Vacancies</p>
                      <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                        {jobDetails.vacancies}
                      </p>
                    </div>
                  )}
                </div>


              </div>
            </div>

            <div className="flex w-full flex-col items-end gap-3 xl:w-auto xl:self-stretch xl:justify-between xl:gap-0">
              <div
                className={
                  jobDetails?.status === "active"
                    ? "rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700 capitalize dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                    : jobDetails?.status === "closed"
                      ? "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700 capitalize dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                      : "rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-700 capitalize dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                }
              >
                {jobDetails?.status || "N/A"}
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => navigate(`/jobs/${jobDetails._id}`)}
                  className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 transition hover:bg-green-600 hover:text-white sm:text-sm dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                >
                  View Job
                </button>
                <button
                  onClick={() => navigate(`/employer/edit-job/${jobDetails._id}`)}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-600 hover:text-white sm:text-sm dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                >
                  Edit Job
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Description Section */}
        {jobDetails?.description && (
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-3 text-lg font-bold text-stone-900 dark:text-stone-50">Job Description</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700 [overflow-wrap:anywhere] dark:text-stone-200">
              {jobDetails.description}
            </p>
          </div>
        )}

        {/* Additional Requirements Section */}
        {jobDetails?.additionalRequirements && (
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-3 text-lg font-bold text-stone-900 dark:text-stone-50">Additional Requirements</h2>
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-stone-700 [overflow-wrap:anywhere] dark:text-stone-200">
              {jobDetails.additionalRequirements}
            </p>
          </div>
        )}

        {/* Benefits & Perks Section */}
        {!!jobDetails?.benefits?.length && (
          <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6 dark:border-stone-800 dark:bg-stone-900">
            <h2 className="mb-4 text-lg font-bold text-stone-900 dark:text-stone-50">Benefits & Perks</h2>
            <div className="flex flex-wrap gap-2">
              {jobDetails.benefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
              statusFilter === "all"
                ? "border-orange-300 ring-2 ring-orange-100 dark:border-orange-500/40 dark:ring-orange-500/20"
                : "border-stone-200 dark:border-stone-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                  {statusCounts.total}
                </p>
                <p className="mt-1 text-sm font-medium text-stone-500">
                  Total Applicants
                </p>
              </div>
              <div className="rounded-xl bg-orange-50 p-2.5 dark:bg-orange-500/10">
                <LuUsers className="text-xl text-orange-600" />
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-stone-100">
              <div className="h-1.5 w-full rounded-full bg-orange-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("new")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
              statusFilter === "new"
                ? "border-amber-300 ring-2 ring-amber-100 dark:border-amber-500/40 dark:ring-amber-500/20"
                : "border-stone-200 dark:border-stone-800"
            }`}
          >
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-700">
                {statusCounts.new}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-500">
                New Applicants
              </p>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-stone-100">
              <div className="h-1.5 w-2/5 rounded-full bg-amber-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("accepted")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
              statusFilter === "accepted"
                ? "border-green-300 ring-2 ring-green-100 dark:border-green-500/40 dark:ring-green-500/20"
                : "border-stone-200 dark:border-stone-800"
            }`}
          >
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-green-700">
                {statusCounts.accepted}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-500">
                Accepted
              </p>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-stone-100">
              <div className="h-1.5 w-1/3 rounded-full bg-green-500" />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md ${
              statusFilter === "rejected"
                ? "border-red-300 ring-2 ring-red-100 dark:border-red-500/40 dark:ring-red-500/20"
                : "border-stone-200 dark:border-stone-800"
            }`}
          >
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-red-700">
                {statusCounts.rejected}
              </p>
              <p className="mt-1 text-sm font-medium text-stone-500">
                Rejected
              </p>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-stone-100">
              <div className="h-1.5 w-1/4 rounded-full bg-red-500" />
            </div>
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:ring-orange-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "new", label: "Pending" },
              { key: "accepted", label: "Accepted" },
              { key: "rejected", label: "Rejected" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  statusFilter === item.key
                    ? "bg-orange-500 text-white"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-orange-200 hover:text-orange-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-orange-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants List */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-14 gap-4 border-b border-stone-200 bg-stone-50 px-5 py-4 text-[11px] font-bold uppercase tracking-wide text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400">
            <div className="col-span-5">Candidate</div>
            <div className="col-span-2">User Status</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Applied</div>
            <div className="col-span-3">Actions</div>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-stone-500">Loading applicants...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              No applicants found.
            </div>
          ) : (
            <div>
              {filteredApplications.map((app, index) => {
                const statusMeta = getStatusMeta(app.status);
                const applicantName = app.applicantId?.name || app.candidateName || "Unknown Applicant";
                const applicantEmail = app.applicantId?.email || app.candidateEmail || "No email";
                const userStatus = app.candidateIsActive === false ? "Deactivated" : "Active";
                const initials = getApplicantInitials(applicantName);

                return (
                  <div
                    key={app._id}
                    onClick={() => openDrawer(app)}
                    className="cursor-pointer border-b border-stone-200 last:border-b-0 transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/40"
                  >
                    {/* Desktop row */}
                    <div className="hidden md:grid grid-cols-14 gap-4 px-5 py-4 items-center">
                      <div className="col-span-5 flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${getAvatarColors(
                            index
                          )}`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-50">
                            {applicantName}
                          </p>
                          <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                            {applicantEmail}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 text-xs text-stone-600">
                        <span
                          className={
                            userStatus === "Active"
                              ? "rounded-full border border-green-600 bg-green-50 px-2 py-1 font-medium text-green-600 dark:border-green-500/40 dark:bg-green-500/10 dark:text-green-200"
                              : "rounded-full border border-red-600 bg-red-50 px-2 py-1 font-medium text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                          }
                        >
                          {userStatus}
                        </span>
                      </div>

                      <div className="col-span-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${statusMeta.className}`}
                        >
                          {statusMeta.icon}
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="col-span-2 text-sm text-stone-600 dark:text-stone-300">
                        {formatDate(app.createdAt)}
                      </div>

                      <div
                        className="col-span-3 flex flex-wrap gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {app.status === "pending" ? (
                          <>
                            <button
                              onClick={() => updateStatus(app._id, "accepted")}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateStatus(app._id, "rejected")}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            className="cursor-default rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                            disabled
                          >
                            Finalized
                          </button>
                        )}

                        {app.resumeId?._id && (
                          <a
                            href={`/resume/${app.resumeId._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                          >
                            Resume
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="md:hidden p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${getAvatarColors(
                            index
                          )}`}
                        >
                          {initials}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2">
                            <div>
                              <p className="truncate text-sm font-bold text-stone-900 dark:text-stone-50">
                                {applicantName}
                              </p>
                              <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                                {applicantEmail}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${statusMeta.className}`}
                              >
                                {statusMeta.icon}
                                {statusMeta.label}
                              </span>

                              <span className="text-xs text-stone-500 dark:text-stone-400">
                                Applied: {formatDate(app.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div
                            className="mt-3 flex flex-wrap gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {app.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => updateStatus(app._id, "accepted")}
                                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => updateStatus(app._id, "rejected")}
                                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                className="cursor-default rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                                disabled
                              >
                                Finalized
                              </button>
                            )}

                            {app.resumeId?._id && (
                              <a
                                href={`/resume/${app.resumeId._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                              >
                                Resume
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Count */}
        <div className="mt-4 text-sm text-stone-500 dark:text-stone-400">
          Showing <span className="font-semibold text-stone-800 dark:text-stone-200">{filteredApplications.length}</span> of{" "}
          <span className="font-semibold text-stone-800 dark:text-stone-200">{applications.length}</span> applicants
        </div>
      </div>

      {/* Drawer Overlay */}
      {displayedApplicant && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl border-l border-stone-200 dark:border-stone-800 dark:bg-stone-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4 dark:border-stone-800 dark:bg-stone-900">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-50">
                Candidate Profile
              </h2>
              <button
                onClick={closeDrawer}
                className="rounded-full border border-stone-200 p-2 text-stone-500 transition hover:bg-stone-100 dark:border-stone-800 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <LuX />
              </button>
            </div>

            <div className="h-[calc(100%-65px)] overflow-y-auto p-5">
              <div className="text-center">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold ${getAvatarColors(
                    applications.findIndex((a) => a._id === displayedApplicant._id) >= 0
                      ? applications.findIndex((a) => a._id === displayedApplicant._id)
                      : 0
                  )}`}
                >
                  {getApplicantInitials(displayedApplicant.applicantId?.name)}
                </div>

                <h3 className="mt-3 text-xl font-extrabold text-stone-900">
                  {displayedApplicant.applicantId?.name || displayedApplicant.candidateName || "Unknown Applicant"}
                </h3>
                <p className="mt-1 text-sm text-stone-500 break-all">
                  {displayedApplicant.applicantId?.email || displayedApplicant.candidateEmail || "No email provided"}
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${getStatusMeta(
                      displayedApplicant.status
                    ).className}`}
                  >
                    {getStatusMeta(displayedApplicant.status).icon}
                    {getStatusMeta(displayedApplicant.status).label}
                  </span>

                  <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
                    Applied {formatDate(displayedApplicant.createdAt)}
                  </span>
                </div>
              </div>

              {/* Summary card */}
              <div className="mt-6 rounded-2xl bg-stone-50 border border-stone-200 p-4 dark:border-stone-800">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-500/10">
                    <LuUsers className="text-lg text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900 dark:text-stone-50">
                      Application Summary
                    </p>
                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                      Review this candidate and take action directly from here.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-stone-500">
                  Actions
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      updateStatus(displayedApplicant._id, "accepted")
                    }
                    disabled={displayedApplicant.status !== "pending"}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      displayedApplicant.status === "pending"
                        ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white"
                        : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                    }`}
                  >
                    Accept
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(displayedApplicant._id, "rejected")
                    }
                    disabled={displayedApplicant.status !== "pending"}
                    className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                      displayedApplicant.status === "pending"
                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white"
                        : "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                    }`}
                  >
                    Reject
                  </button>
                </div>

                {displayedApplicant.resumeId?._id && (
                  <a
                    href={`/resume/${displayedApplicant.resumeId._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 transition hover:bg-orange-500 hover:text-white dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                  >
                    <LuFileText />
                    View Resume
                  </a>
                )}
              </div>

              {/* Candidate details */}
              <div className="mt-6 space-y-5">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                    Candidate Details
                  </p>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 space-y-3 dark:border-stone-800 dark:bg-stone-950">
                    <div>
                      <p className="text-xs text-stone-500">Full Name</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        {displayedApplicant.applicantId?.name || displayedApplicant.candidateName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">Email</p>
                      <p className="text-sm font-semibold text-stone-900 break-all dark:text-stone-50">
                        {displayedApplicant.applicantId?.email || displayedApplicant.candidateEmail || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">User Status</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        {displayedApplicant.candidateIsActive !== undefined
                          ? displayedApplicant.candidateIsActive
                            ? "Active"
                            : "Inactive"
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">Application Status</p>
                      <p className="text-sm font-semibold text-stone-900 capitalize dark:text-stone-50">
                        {displayedApplicant.status || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-stone-500">Applied On</p>
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        {formatDate(displayedApplicant.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {!!jobDetails?.requirements?.length && (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                      Job Requirements
                    </p>
                    <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                      <div className="flex flex-wrap gap-2">
                        {jobDetails.requirements.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                    Recruiter Notes
                  </p>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
                    <textarea
                      rows={4}
                      placeholder="Add private notes about this candidate..."
                      className="w-full resize-none rounded-xl border border-stone-200 bg-white p-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:ring-orange-500/20"
                    />
                    <button className="mt-3 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:text-orange-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-orange-500/40 dark:hover:text-orange-300">
                      Save Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}