import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import {
  LuUsers,
  LuUserCheck,
  LuBuilding2,
  LuShield,
  LuBriefcaseBusiness,
  LuClock3,
  LuStar,
  LuClipboardList,
  LuUserX,
} from "react-icons/lu";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || "Failed to load dashboard");
        return;
      }

      setData(result);
    } catch {
      alert("Failed to load admin dashboard");
    }
  }

  const stats = data?.stats || {};

  const cards = [
    { label: "Total Users", value: stats.totalUsers || 0, icon: <LuUsers size={20} /> },
    { label: "Candidates", value: stats.totalCandidates || 0, icon: <LuUserCheck size={20} /> },
    { label: "Employers", value: stats.totalEmployers || 0, icon: <LuBuilding2 size={20} /> },
    { label: "Admins", value: stats.totalAdmins || 0, icon: <LuShield size={20} /> },
    { label: "Total Jobs", value: stats.totalJobs || 0, icon: <LuBriefcaseBusiness size={20} /> },
    { label: "Pending Jobs", value: stats.pendingJobs || 0, icon: <LuClock3 size={20} /> },
    { label: "Featured Jobs", value: stats.featuredJobs || 0, icon: <LuStar size={20} /> },
    { label: "Applications", value: stats.totalApplications || 0, icon: <LuClipboardList size={20} /> },
    { label: "Suspended Users", value: stats.suspendedUsers || 0, icon: <LuUserX size={20} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
          JobNexus Admin
        </p>
        <h1 className="mt-1 text-3xl font-black text-stone-900 dark:text-stone-50">Dashboard</h1>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-300">
          Monitor users, jobs, applications, and platform activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                {card.icon}
              </div>
              <span className="text-3xl font-black text-stone-900 dark:text-stone-50">{card.value}</span>
            </div>
            <p className="mt-4 text-sm font-semibold text-stone-600 dark:text-stone-300">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Users + Jobs */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-50">Recent Users</h2>
          <div className="mt-4 space-y-3">
            {(data?.recentUsers || []).map((user) => (
              <div
                key={user._id}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-50">{user.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-300">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                      {user.role}
                    </span>
                    {user.isVerified && (
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-500/10 dark:text-green-200">
                        Verified
                      </span>
                    )}
                    {user.isSuspended && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-200">
                        Suspended
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-black text-stone-900 dark:text-stone-50">Recent Jobs</h2>
          <div className="mt-4 space-y-3">
            {(data?.recentJobs || []).map((job) => (
              <div
                key={job._id}
                className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-50">{job.title}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-300">
                      {job.company} • {job.location}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                      {job.approvalStatus}
                    </span>
                    {job.isFeatured && (
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-200">
                        Featured
                      </span>
                    )}
                    {!job.isActive && (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-red-500/10 dark:text-red-200">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}