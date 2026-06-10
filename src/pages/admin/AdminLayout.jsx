import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { API_BASE } from "../../config";
import { clearAuthState, deleteCookie } from "../../utils/cookies";
import {
  LuLayoutDashboard,
  LuUser,
  LuUsers,
  LuBriefcaseBusiness,
  LuClipboardList,
  LuTriangleAlert,
  LuShield,
  LuLogOut,
} from "react-icons/lu";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", path: "/admin", icon: <LuLayoutDashboard size={18} /> },
    { label: "My Profile", path: "/admin/profile", icon: <LuUser size={18} /> },
    { label: "Users", path: "/admin/users", icon: <LuUsers size={18} /> },
    { label: "Jobs", path: "/admin/jobs", icon: <LuBriefcaseBusiness size={18} /> },
    { label: "Applications", path: "/admin/applications", icon: <LuClipboardList size={18} /> },
    { label: "Reports", path: "/admin/reports", icon: <LuTriangleAlert size={18} /> },
  ];

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    deleteCookie("session");
    deleteCookie("role");
    deleteCookie("name");
    deleteCookie("email");
    deleteCookie("userId");
    deleteCookie("companyName");
    clearAuthState();

    // Clean up legacy storage keys without nuking theme/drafts.
    localStorage.removeItem("token");

    navigate("/login");
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:h-fit dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <LuShield size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">Admin Panel</h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">Platform controls</p>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      active
                        ? "bg-orange-500 text-white"
                        : "text-stone-700 hover:bg-orange-50 hover:text-orange-600 dark:text-stone-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-200"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
            >
              <LuLogOut size={16} />
              Logout
            </button>
          </aside>

          {/* Content */}
          <section>
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}