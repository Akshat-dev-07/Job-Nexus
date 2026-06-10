import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import { IoMdListBox } from "react-icons/io";
import { FaUser } from "react-icons/fa6";
import { IoMdTime } from "react-icons/io";
import { FaRegCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCookie } from "../utils/cookies";

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [applicantions, setApplications] = useState({});
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const [weekStats, setWeekStats] = useState({
    jobsCreated: 0,
    applicationsCreated: 0,
    pendingCreated: 0,
    acceptedCreated: 0,
  });

  const userId = getCookie("userId");

  async function loadDashboardData() {
    const res = await fetch(
      `${API_BASE}/api/applications/employer/${userId}/jobs`,
      {
        credentials: "include",
      },
    );

    const data = await res.json();
    setJobs(data);
    const allApplicants = [];
    for (const job of data) {
      const res = await fetch(
        `${API_BASE}/api/applications/job/${job._id}/applicants`,
        {
          credentials: "include",
        },
      );
      const apps = await res.json();
      setApplications((prev) => ({ ...prev, [job._id]: apps.length }));
      allApplicants.push(...apps);

    }
    setApplicants(allApplicants);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const createdInLastWeek = (dateValue) => {
      const timestamp = new Date(dateValue).getTime();
      return Number.isFinite(timestamp) && timestamp >= weekAgo;
    };

    const jobsCreated = Array.isArray(data)
      ? data.filter((job) => createdInLastWeek(job?.createdAt)).length
      : 0;
    const applicationsCreated = allApplicants.filter((app) => createdInLastWeek(app?.createdAt)).length;
    const pendingCreated = allApplicants.filter(
      (app) => app?.status === "pending" && createdInLastWeek(app?.createdAt),
    ).length;
    const acceptedCreated = allApplicants.filter(
      (app) => app?.status === "accepted" && createdInLastWeek(app?.createdAt),
    ).length;

    setWeekStats({ jobsCreated, applicationsCreated, pendingCreated, acceptedCreated });

    const statusCounts = { accepted: 0, pending: 0, rejected: 0 };
    for (const app of allApplicants) {
      if (app.status === "accepted") {
        statusCounts.accepted += 1;
      }
      if (app.status === "pending") {
        statusCounts.pending += 1;
      } else if (app.status === "rejected") {
        statusCounts.rejected += 1;
      }
    }
    setAcceptedCount(statusCounts.accepted);
    setPendingCount(statusCounts.pending);
    setRejectedCount(statusCounts.rejected);
  }
  async function closeHandler(jobId) {
    await fetch(`${API_BASE}/api/jobs/${jobId}/close`, {
      method: "POST",
      credentials: "include",
    });
    loadDashboardData();
  }

  useEffect(() => {
    if (!userId) return;
    loadDashboardData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-stone-100 px-10 py-8 text-stone-900 dark:bg-stone-950 dark:text-stone-50">
      <h1 className="mb-6 text-3xl font-bold">Employer Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-10">
        <div className="flex items-center rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mr-4 rounded bg-orange-50 p-3 dark:bg-orange-500/10">
            <IoMdListBox className="text-xl text-orange-500 " />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-left">{jobs.length}</h2>
            <p className="text-xs text-stone-500">Active Jobs</p>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              +{weekStats.jobsCreated} this week
            </p>
          </div>
        </div>
        <div className="flex items-center rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mr-4 rounded bg-blue-50 p-3 dark:bg-blue-500/10">
            <FaUser className="text-xl text-blue-400 " />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-left">
              {applicants.length}
            </h2>
            <p className="text-xs text-stone-500">Total Applicants</p>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              +{weekStats.applicationsCreated} this week
            </p>
          </div>
        </div>
        <div className="flex items-center rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mr-4 rounded bg-yellow-50 p-3 dark:bg-yellow-500/10">
            <IoMdTime className="text-xl text-yellow-500 " />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-left">{pendingCount}</h2>
            <p className="text-xs text-stone-500">Jobs Awaiting Review</p>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              +{weekStats.pendingCreated} this week
            </p>
          </div>
        </div>
        <div className="flex items-center rounded-xl border border-stone-200 bg-white p-4 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <div className="mr-4 rounded bg-purple-50 p-3 dark:bg-purple-500/10">
            <FaRegCheckCircle className="text-xl text-purple-500 " />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-left">{acceptedCount}</h2>
            <p className="text-xs text-stone-500">Hired this Month</p>
            <p className="text-xs font-semibold text-green-700 dark:text-green-300">
              +{weekStats.acceptedCreated} this week
            </p>
          </div>
        </div>
      </div>

      {/* Jobs */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your Jobs</h2>
        <table className="w-full divide-y divide-stone-200 rounded-xl bg-white shadow-sm dark:divide-stone-800 dark:bg-stone-900">
          <thead className="bg-stone-50 dark:bg-stone-950">
            <tr className="h-12 w-full divide-y divide-stone-200 rounded-tl-lg rounded-tr-lg dark:divide-stone-800">
              <th className="p-4 text-left text-sm font-normal text-stone-500">Title</th>
              <th className="p-4 text-left text-sm font-normal text-stone-500">Location</th>
              <th className="p-4 pr-0 text-left text-sm font-normal text-stone-500">Type</th>
              <th className="p-4 pr-0 text-left text-sm font-normal text-stone-500">Status</th>
              <th className="p-4 pr-0 text-left text-sm font-normal text-stone-500">Posted On</th>

              <th className="text-left text-sm font-normal text-stone-500">
                Applicants
              </th>
              <th className="p-4 pr-0 text-center text-sm font-normal text-stone-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job._id}
                className="border-b border-stone-200 transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800/40"
              >
                <td className="p-4 text-left text-sm font-medium text-stone-900 dark:text-stone-100">
                  {job.title}
                  <p className="text-xs font-normal text-stone-500">{job.company}</p>
                </td>
                <td className="p-4 text-left text-sm text-stone-500">
                  {job.location}
                </td>
                <td className="text-left text-xs font-semibold capitalize p-4 pr-0">
                  <span
                    className={
                      job.type === "Full-Time"
                        ? "rounded-xl border border-blue-300 bg-blue-50 px-2 py-1 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-200"
                        : job.type === "Part-Time"
                          ? "rounded-xl border border-yellow-300 bg-yellow-50 px-2 py-1 text-yellow-900 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200"
                          : "rounded-xl border border-green-300 bg-green-50 px-2 py-1 text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                    }
                  >
                    {job.type}
                  </span>
                </td>
                <td className="p-4 pr-0 text-left text-xs font-semibold text-stone-500">
                  <span
                    className={
                      job.status === "active"
                        ? "rounded-xl border border-green-300 bg-green-50 px-2 py-1 capitalize text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200"
                        : job.status === "closed"
                          ? "rounded-xl border border-red-400 bg-red-50 px-2 py-1 capitalize text-red-900 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"
                          : "rounded-xl border border-yellow-300 bg-yellow-50 px-2 py-1 capitalize text-yellow-900 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200"
                    }
                  >
                    {job.status}
                  </span>
                </td>
                <td className="p-4 pr-0 text-left text-xs font-semibold text-yellow-600 dark:text-yellow-300">
                  {new Date(job.createdAt).toLocaleDateString()}
                </td>

                <td className="text-left text-sm text-orange-500 font-semibold p-4 pr-0">
                  {applicantions[job._id] || 0}
                </td>
                <td className="flex justify-center gap-2 p-4 pr-0 text-left text-sm text-stone-500">
                  <Link
                    className="rounded-lg border-2 border-stone-200 px-2 py-1 text-xs font-medium text-stone-900 transition hover:border-blue-300 hover:bg-blue-200 hover:text-blue-700 dark:border-stone-700 dark:text-stone-100 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-200"
                    to={`/employer-dashboard/applicants/${job._id}`}
                  >
                    View
                  </Link>
                  <button
                    className="rounded-lg border-2 border-stone-200 px-2 py-1 text-xs font-medium text-stone-900 transition hover:border-red-300 hover:bg-red-200 hover:text-red-700 dark:border-stone-700 dark:text-stone-100 dark:hover:border-red-500/40 dark:hover:bg-red-500/10 dark:hover:text-red-200"
                    onClick={() => closeHandler(job._id)}
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
