import { useEffect, useMemo, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import { clearAuthState, deleteCookie, getCookie } from "../utils/cookies";
import logo from "../assets/logo.png";
import {
  LuMenu,
  LuX,
  LuUser,
  LuLogOut,
  LuLayoutDashboard,
  LuFileText,
  LuPlus,
  LuBuilding2,
  LuMoon,
  LuSun,
} from "react-icons/lu";

const THEME_KEY = "theme";

function getInitialTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // ignore
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

function applyTheme(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

function persistTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export default function Navbar() {
  const navigate = useNavigate();

  const role = getCookie("role");
  const userName = getCookie("name");
  const companyName = getCookie("companyName");
  const isLoggedIn = Boolean(getCookie("session"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [theme, setTheme] = useState(() => getInitialTheme());
  const isDark = theme === "dark";

  const themeToggleAriaLabel = isDark
    ? "Switch to light mode"
    : "Switch to dark mode";
  const themeToggleTitle = themeToggleAriaLabel;

  function ThemeSwitch({ fullWidth = false }) {
    return (
      <label
        className={
          fullWidth
            ? "inline-flex w-full items-center justify-center"
            : "inline-flex items-center"
        }
      >
        <span className="sr-only">{themeToggleAriaLabel}</span>
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isDark}
          onChange={toggleTheme}
          aria-label={themeToggleAriaLabel}
        />

        <span
          title={themeToggleTitle}
          className={
            "relative inline-flex h-9 w-16 cursor-pointer items-center rounded-full border transition-colors duration-300 ease-in-out " +
            "border-orange-200 bg-orange-100 hover:bg-orange-50 " +
            "peer-checked:border-stone-700 peer-checked:bg-stone-800 " +
            "dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800 " +
            "peer-checked:[&_.knob]:translate-x-7 peer-checked:[&_.knob]:bg-stone-200 " +
            "peer-checked:[&_.sun]:text-orange-200 peer-checked:[&_.moon]:text-stone-200 " +
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500/30 " +
            "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white " +
            "dark:peer-focus-visible:ring-orange-500/25 dark:peer-focus-visible:ring-offset-stone-950"
          }
        >
          <span className="moon pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-stone-700 transition-colors duration-300 ease-in-out dark:text-stone-200">
            <LuMoon size={16} />
          </span>
          <span className="sun pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-orange-600 transition-colors duration-300 ease-in-out dark:text-stone-200">
            <LuSun size={16} />
          </span>

          <span
            className={
              "knob absolute left-1 top-1 h-7 w-7 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out dark:bg-stone-50"
            }
          />
        </span>
      </label>
    );
  }

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key !== THEME_KEY) return;
      const next = e.newValue;
      if (next === "dark" || next === "light") {
        setTheme((prev) => (prev === next ? prev : next));
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const activeClass =
    "rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300";
  const inactiveClass =
    "rounded-xl px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-200 dark:hover:bg-stone-800 dark:hover:text-stone-50";

  const displayName = useMemo(() => {
    if (role === "employer") return companyName || userName || "Employer";
    return userName || "User";
  }, [role, companyName, userName]);

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    } finally {
      // Best-effort cleanup for UI cookies (httpOnly token is cleared server-side)
      deleteCookie("session");
      deleteCookie("role");
      deleteCookie("name");
      deleteCookie("email");
      deleteCookie("userId");
      deleteCookie("companyName");
      clearAuthState();

      // Backward-compat cleanup (old localStorage auth keys)
      try {
        localStorage.removeItem("token");
      } catch {
        // ignore
      }

      window.location.href = "/";
    }
  }

  function goToProfile() {
    setProfileOpen(false);
    setMobileOpen(false);

    if (role === "employer") {
      navigate("/employer/profile");
    } else if (role === "admin") {
      navigate("/admin/profile");
    } else {
      navigate("/profile");
    }
  }

  const navItems = [
    { to: "/", label: "Home", show: true },
    { to: "/jobs", label: "Jobs", show: true },
    { to: "/companies", label: "Companies", show: true },
    { to: "/resume", label: "Resume Builder", show: role !== "employer" },
    {
      to: role === "employer" ? "/employer-dashboard" : "/my-applications",
      label: "Dashboard",
      show: role !== "admin",
    },
    { to: "/post-job", label: "Post Job", show: role === "employer" },
    { to: "/admin", label: "Admin Panel", show: role === "admin" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-all duration-300 "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-orange-100 dark:from-black dark:to-stone-800 shadow-md shadow-orange-200 dark:shadow-orange-500 ring-1 ring-orange-200 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-orange-300
            dark:group-hover:shadow-orange-500/50 group-hover:ring-orange-300">
              <img
                src={logo}
                alt="JobNexus"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent">
                JobNexus
              </span>
              <span className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-orange-400">
                Job Portal & Resume Builder
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-1 lg:flex">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    isActive ? activeClass : inactiveClass
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </div>

          {/* Desktop Right */}
          <div className="hidden items-center gap-3 lg:flex">
            <ThemeSwitch />
            {!isLoggedIn ? (
              <>
                <Link
                  to="/signup"
                  className="rounded-2xl border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-orange-400/60 dark:hover:bg-orange-500/10"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="rounded-2xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Login
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2 transition hover:border-orange-300 dark:border-orange-400/30 dark:bg-orange-500/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {(displayName || "U").charAt(0).toUpperCase()}
                  </span>

                  <div className="text-left">
                    <p className="max-w-[160px] truncate text-sm font-bold text-stone-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-stone-500 capitalize">{role}</p>
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900">
                    <button
                      onClick={goToProfile}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      {role === "employer" ? (
                        <LuBuilding2 size={18} />
                      ) : (
                        <LuUser size={18} />
                      )}
                      {role === "employer" ? "Company Profile" : "My Profile"}
                    </button>

                    <Link
                      to={
                        role === "employer"
                          ? "/employer-dashboard"
                          : role === "candidate"
                            ? "/my-applications"
                            : "/admin"
                      }
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      <LuLayoutDashboard size={18} />
                      {role === "admin" ? "Admin Panel" : "Dashboard"}
                    </Link>

                    {role === "candidate" && (
                      <Link
                        to="/resume"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        <LuFileText size={18} />
                        Resume Builder
                      </Link>
                    )}

                    {role === "employer" && (
                      <Link
                        to="/post-job"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        <LuPlus size={18} />
                        Post a Job
                      </Link>
                    )}

                    <div className="my-2 border-t border-stone-100 dark:border-stone-800" />

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LuLogOut size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-2xl border border-stone-200 p-2 text-stone-700 dark:border-stone-800 dark:text-stone-200 lg:hidden"
          >
            {mobileOpen ? <LuX size={22} /> : <LuMenu size={22} />}
          </button>
        </nav>

        {/* Mobile Panel */}
        {mobileOpen && (
          <div className="border-t border-stone-200 py-4 dark:border-stone-800 lg:hidden">
            <div className="mb-3">
              <ThemeSwitch fullWidth />
            </div>
            <div className="space-y-2">
              {navItems
                .filter((item) => item.show)
                .map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block ${isActive ? activeClass : inactiveClass}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
            </div>

            <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
              {!isLoggedIn ? (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl border border-orange-300 px-4 py-3 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-50 dark:border-orange-400/60 dark:hover:bg-orange-500/10"
                  >
                    Sign Up
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl bg-orange-500 px-4 py-3 text-center text-sm font-bold text-white"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={goToProfile}
                    className="flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left dark:border-stone-800 dark:bg-stone-900"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 font-bold text-white">
                      {(displayName || "U").charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-stone-900">
                        {displayName}
                      </p>
                      <p className="text-xs capitalize text-stone-500">
                        {role}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                  >
                    <LuLogOut size={18} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
