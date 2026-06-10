import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";
import { setAuthState } from "../utils/cookies";
import {
  LuBriefcase,
  LuMail,
  LuLock,
  LuBadgeCheck,
  LuTriangleAlert,
} from "react-icons/lu";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  function showToast(message, type = "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const canSubmit = useMemo(() => {
    return email.trim() && password.trim();
  }, [email, password]);

  async function handleLogin(e) {
    e.preventDefault();

    if (!canSubmit) {
      showToast("Please enter email and password", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = { message: "Server returned an invalid response" };
      }

      if (!res.ok) {
        showToast(data.message || "Login failed", "error");
        setIsSubmitting(false);
        return;
      }

      setAuthState({
        session: "1",
        role: data?.role || "",
        name: data?.name || "",
        email: data?.email || email,
        userId: data?.userId || "",
        companyName: data?.companyName || "",
        isVerified: data?.isVerified ? "true" : "false",
      });

      showToast("Login successful!", "success");

      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error(error);
      showToast("Server not reachable", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {toast && (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`min-w-[260px] rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-200 bg-white text-green-700"
                : "border-red-200 bg-white text-red-700"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {toast.type === "success" ? <LuBadgeCheck /> : <LuTriangleAlert />}
              {toast.message}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-10 text-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <LuBriefcase />
              JobNexus
            </div>

            <h1 className="mt-8 text-4xl font-black leading-tight">
              Welcome back to
              <br />
              your hiring hub.
            </h1>

            <p className="mt-4 max-w-md text-white/85">
              Sign in to continue posting jobs, managing applicants, or applying
              to your next opportunity.
            </p>
          </div>

          <div className="space-y-4">
            {[
              "Candidates can track applications and build stronger resumes",
              "Employers can manage jobs, applications, and shortlist workflows",
              "Fast, role-aware access across your platform",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
              >
                <p className="text-sm font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <form
            onSubmit={handleLogin}
            className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6">
              <h2 className="text-3xl font-black text-stone-900">Login</h2>
              <p className="mt-2 text-sm text-stone-500">
                Enter your credentials to access your account.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Email
                </label>
                <div className="relative">
                  <LuMail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <LuLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-70"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="mt-5 text-center text-sm text-stone-500">
              New here?{" "}
              <Link to="/signup" className="font-semibold text-orange-600 hover:underline">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}