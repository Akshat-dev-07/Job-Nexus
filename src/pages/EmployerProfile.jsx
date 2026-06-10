import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import {
  LuBuilding2,
  LuMail,
  LuGlobe,
  LuUsers,
  LuMapPin,
  LuSave,
  LuLoaderCircle,
  LuTriangleAlert,
  LuCheck,
  LuPencil,
  LuX,
  LuLock,
} from "react-icons/lu";
import toast from "react-hot-toast";
import { clearAuthState, deleteCookie, getCookie, setCookie } from "../utils/cookies";

export default function EmployerProfile() {
  const role = getCookie("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    companyName: "",
    companyWebsite: "",
    industry: "",
    companySize: "1-10",
    companyCity: "",
    companyDescription: "",
    hiringFor: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null); // "save" | "delete"

  const [credentialForm, setCredentialForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [credentialSaving, setCredentialSaving] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [credentialStep, setCredentialStep] = useState("choose"); // "choose" | "form"
  const [credentialMode, setCredentialMode] = useState({ email: false, password: false });

  const hiringOptions = ["Engineering", "Design", "Marketing", "Sales", "Operations", "HR", "Finance"];
  const industrySamples = ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Education"];

  const completion = useMemo(() => {
    const checks = [
      !!form.name,
      !!form.email,
      !!form.companyName,
      !!form.companyWebsite,
      !!form.industry,
      !!form.companySize,
      !!form.companyCity,
      !!form.companyDescription,
      (form.hiringFor || []).length > 0,
    ];

    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  useEffect(() => {
    if (role !== "employer") return;
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE}/api/users/me`, {
        credentials: "include",
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        toast.error(data?.message || "Failed to load profile");
        return;
      }

      setForm({
        name: data.name || "",
        email: data.email || "",
        companyName: data.companyName || "",
        companyWebsite: data.companyWebsite || "",
        industry: data.industry || "",
        companySize: data.companySize || "1-10",
        companyCity: data.companyCity || "",
        companyDescription: data.companyDescription || "",
        hiringFor: Array.isArray(data.hiringFor) ? data.hiringFor : [],
      });

      setCredentialForm((prev) => ({
        ...prev,
        email: data.email || "",
      }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleCredentialChange(e) {
    setCredentialForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleUpdateCredentials(e) {
    e.preventDefault();

    const trimmedCurrentPassword = credentialForm.currentPassword.trim();
    const trimmedNewPassword = credentialForm.newPassword.trim();
    const trimmedConfirm = credentialForm.confirmPassword.trim();
    const trimmedEmail = credentialForm.email.trim();

    if (!trimmedCurrentPassword) {
      toast.error("Current password is required");
      return;
    }

    const emailChanged =
      credentialMode.email &&
      trimmedEmail &&
      trimmedEmail.toLowerCase() !== (form.email || "").toLowerCase();

    const wantsPasswordChange = credentialMode.password && Boolean(trimmedNewPassword);
    if (wantsPasswordChange) {
      if (trimmedNewPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }
      if (trimmedNewPassword !== trimmedConfirm) {
        toast.error("New password and confirmation do not match");
        return;
      }
    }

    if (!emailChanged && !wantsPasswordChange) {
      toast.error("No credential changes to update");
      return;
    }

    setCredentialSaving(true);
    try {
      const payload = {
        currentPassword: trimmedCurrentPassword,
      };

      if (emailChanged) payload.newEmail = trimmedEmail;
      if (wantsPasswordChange) payload.newPassword = trimmedNewPassword;

      const res = await fetch(`${API_BASE}/api/users/credentials`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data) {
        toast.error(data?.message || "Failed to update credentials");
        return;
      }

      if (data?.user?.email) {
        setForm((prev) => ({ ...prev, email: data.user.email }));
        setCookie("email", data.user.email);
        setCredentialForm((prev) => ({ ...prev, email: data.user.email }));
      }

      setCredentialForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      toast.success(data?.message || "Credentials updated successfully");
      setShowCredentialModal(false);
      setCredentialStep("choose");
      setCredentialMode({ email: false, password: false });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update credentials");
    } finally {
      setCredentialSaving(false);
    }
  }

  function toggleHiringFor(value) {
    if (!isEditMode) return; // Prevent changes when not in edit mode

    setForm((prev) => {
      const current = prev.hiringFor || [];
      const exists = current.includes(value);
      return {
        ...prev,
        hiringFor: exists ? current.filter((x) => x !== value) : [...current, value],
      };
    });
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      toast.error("Company name is required");
      return;
    }

    setPasswordAction("save");
    setPasswordInput("");
    setShowPasswordModal(true);
  }

  function handleDeleteAccount() {
    setPasswordAction("delete");
    setPasswordInput("");
    setShowPasswordModal(true);
  }

  async function confirmPasswordAction(password) {
    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    setPasswordLoading(true);
    try {
      if (passwordAction === "delete") {
        setDeleting(true);

        const res = await fetch(`${API_BASE}/api/users/deleteAccount`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          toast.error(data?.message || "Failed to delete account");
          return;
        }

        toast.success(data?.message || "Account deleted successfully");
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
        window.location.href = "/";
        return;
      }

      if (passwordAction === "save") {
        setSaving(true);

        const res = await fetch(`${API_BASE}/api/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            password,
          }),
        });

        let data;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok) {
          toast.error(data?.message || "Failed to update profile");
          return;
        }

        toast.success(data?.message || "Profile updated successfully");
        if (form?.name) setCookie("name", form.name);
        if (form?.email) setCookie("email", form.email);
        if (form?.companyName) setCookie("companyName", form.companyName);
        setShowPasswordModal(false);
        setPasswordInput("");
        setPasswordAction(null);
        setIsEditMode(false);
        return;
      }
    } catch (error) {
      console.error(error);
      toast.error(
        passwordAction === "delete"
          ? "Failed to delete account"
          : "Failed to update profile"
      );
    } finally {
      setPasswordLoading(false);
      setSaving(false);
      setDeleting(false);
    }
  }

  function getInputClass() {
    return `mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none transition ${
      isEditMode
        ? "border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
        : "border-stone-200 bg-white text-stone-700 cursor-default dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-200"
    }`;
  }

  function getSelectClass() {
    return `mt-2 w-full rounded-xl border px-4 py-2 text-sm outline-none transition ${
      isEditMode
        ? "border-stone-200 bg-white text-stone-900 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
        : "border-stone-200 bg-white text-stone-700 cursor-default dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-200"
    }`;
  }

  if (role !== "employer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4 dark:bg-stone-950">
        <div className="rounded-3xl border border-red-200 bg-white p-8 dark:border-red-900/50 dark:bg-stone-900">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-red-600 dark:bg-red-500/10 dark:text-red-300">
              <LuTriangleAlert size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Access Denied</h2>
              <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                Only employers can access this page
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900 dark:text-stone-50">Company Profile</h1>
            <p className="mt-2 text-stone-600 dark:text-stone-300">
              {isEditMode
                ? "Edit your company information and hiring preferences"
                : "Manage your company information and hiring preferences"}
            </p>
          </div>
          {!isEditMode && (
            <button
              onClick={() => setIsEditMode(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              <LuPencil size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
              <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
                Loading profile...
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-6">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-2xl font-black text-white">
                    {(form.companyName || form.name || "C").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">
                      {form.companyName || "Company"}
                    </h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Employer Account</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-stone-700 dark:text-stone-200">
                      Profile Completion
                    </span>
                    <span className="font-bold text-orange-600">{completion}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6 dark:border-stone-800 dark:from-stone-900 dark:to-stone-900">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                    Contact Information
                  </h2>
                </div>

                <div className="space-y-5 p-8">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                      <LuUsers className="mb-1 inline" size={16} /> Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                      placeholder="Your Full Name"
                      className={getInputClass()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                      <LuMail className="mb-1 inline" size={16} /> Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      className="mt-2 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                    />
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      Use Sign-in Credentials to update your email
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign-in Credentials */}
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6 dark:border-stone-800 dark:from-stone-900 dark:to-stone-900">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
                    Sign-in Credentials
                  </h2>
                </div>

                <div className="space-y-4 p-8">
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    Update your sign-in email or password. For security, your current password is required.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCredentialStep("choose");
                      setCredentialMode({ email: false, password: false });
                      setShowCredentialModal(true);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
                  >
                    <LuLock size={16} />
                    Update credentials
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm dark:border-red-900/50 dark:bg-stone-900">
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-50">Account Management</h3>
                <p className="mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400">
                  Deleting your account will remove your company profile and job postings.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || passwordLoading}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-70 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-500/10"
                >
                  Delete Account
                </button>
              </div>
            </aside>

            <div className="space-y-6">
              {/* Company Information */}
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6 dark:border-stone-800 dark:from-stone-900 dark:to-stone-900">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Company Information</h2>
                </div>

                <div className="space-y-5 p-8">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                    <LuBuilding2 className="mb-1 inline" size={16} /> Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={form.companyName}
                    onChange={handleChange}
                    readOnly={!isEditMode}
                    placeholder="Your Company Name"
                    className={getInputClass()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                    <LuGlobe className="mb-1 inline" size={16} /> Website
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      name="companyWebsite"
                      value={form.companyWebsite}
                      onChange={handleChange}
                      placeholder="https://example.com"
                      className={getInputClass()}
                    />
                  ) : (
                    <div className="mt-2">
                      {form.companyWebsite ? (
                        <a
                          href={form.companyWebsite.startsWith('http') ? form.companyWebsite : `https://${form.companyWebsite}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-orange-600 underline transition-colors hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          {form.companyWebsite}
                        </a>
                      ) : (
                        <span className="text-stone-400 italic dark:text-stone-500">No website provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={form.industry}
                      onChange={handleChange}
                      readOnly={!isEditMode}
                      placeholder="e.g., Technology"
                      list="industry-list"
                      className={getInputClass()}
                    />
                    <datalist id="industry-list">
                      {industrySamples.map((ind) => (
                        <option key={ind} value={ind} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Company Size</label>
                    <select
                      name="companySize"
                      value={form.companySize}
                      onChange={handleChange}
                      disabled={!isEditMode}
                      className={getSelectClass()}
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="200+">200+ employees</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                    <LuMapPin className="mb-1 inline" size={16} /> City
                  </label>
                  <input
                    type="text"
                    name="companyCity"
                    value={form.companyCity}
                    onChange={handleChange}
                    readOnly={!isEditMode}
                    placeholder="Your Company City"
                    className={getInputClass()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Company Description</label>
                  <textarea
                    name="companyDescription"
                    value={form.companyDescription}
                    onChange={handleChange}
                    readOnly={!isEditMode}
                    placeholder="Tell candidates about your company..."
                    rows="5"
                    className={getInputClass()}
                  />
                </div>
              </div>
            </div>

              {/* Hiring Preferences */}
              <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="border-b border-stone-200 bg-gradient-to-r from-orange-50 to-amber-50 px-8 py-6 dark:border-stone-800 dark:from-stone-900 dark:to-stone-900">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Currently Hiring For</h2>
                </div>

                <div className="space-y-3 p-8">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {hiringOptions.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                          isEditMode
                            ? "cursor-pointer border-stone-200 hover:border-orange-300 hover:bg-orange-50 dark:border-stone-800 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10"
                            : "cursor-default border-stone-200 dark:border-stone-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={form.hiringFor.includes(option)}
                          onChange={() => toggleHiringFor(option)}
                          className="h-4 w-4 rounded border-stone-300 text-orange-500 focus:ring-orange-500 dark:border-stone-600 dark:bg-stone-950"
                        />
                        <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              {isEditMode && (
                <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-white px-8 py-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                  <div>
                    <p className="text-sm text-stone-600 dark:text-stone-300">
                      Make sure all information is accurate before saving
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        fetchProfile();
                      }}
                      className="rounded-xl border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-stone-700"
                    >
                      {saving ? (
                        <>
                          <LuLoaderCircle className="animate-spin" size={18} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <LuSave size={18} />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Confirmation Modal */}
              {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-lg dark:border-stone-800 dark:bg-stone-900">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                        <LuLock size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Confirm Password</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400">
                          {passwordAction === "delete"
                            ? "Enter your password to delete your account"
                            : "Enter your password to save changes"}
                        </p>
                      </div>
                    </div>

                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && confirmPasswordAction(passwordInput)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none placeholder:text-stone-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 mb-6 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                      autoFocus
                    />

                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setShowPasswordModal(false);
                          setPasswordInput("");
                          setPasswordAction(null);
                        }}
                        disabled={passwordLoading}
                        className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                      >
                        <LuX className="inline mr-2" size={16} />
                        Cancel
                      </button>
                      <button
                          onClick={() => confirmPasswordAction(passwordInput)}
                        disabled={passwordLoading || !passwordInput.trim()}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-stone-300 disabled:cursor-not-allowed dark:disabled:bg-stone-700"
                      >
                        {passwordLoading ? (
                          <>
                            <LuLoaderCircle className="animate-spin" size={16} />
                              {passwordAction === "delete" ? "Deleting..." : "Verifying..."}
                          </>
                        ) : (
                          <>
                            <LuCheck size={16} />
                              {passwordAction === "delete" ? "Delete" : "Confirm"}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Credentials Update Modal */}
              {showCredentialModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-lg dark:border-stone-800 dark:bg-stone-900">
                    <div className="mb-6 flex items-start gap-3">
                      <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                        <LuLock size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Update credentials</h3>
                        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                          Current password is required to confirm changes.
                        </p>
                      </div>
                    </div>

                    {credentialStep === "choose" ? (
                      <div className="space-y-5">
                        <p className="text-sm text-stone-600 dark:text-stone-300">What would you like to change?</p>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCredentialMode({ email: true, password: false });
                              setCredentialStep("form");
                            }}
                            className="rounded-2xl border border-stone-200 p-5 text-left transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
                          >
                            <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50">
                              <LuMail size={16} /> Change email
                            </div>
                            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Update the email used to sign in.</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCredentialMode({ email: false, password: true });
                              setCredentialStep("form");
                            }}
                            className="rounded-2xl border border-stone-200 p-5 text-left transition hover:bg-stone-50 dark:border-stone-800 dark:hover:bg-stone-800"
                          >
                            <div className="flex items-center gap-2 font-semibold text-stone-900 dark:text-stone-50">
                              <LuLock size={16} /> Change password
                            </div>
                            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">Set a new password for your account.</p>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setShowCredentialModal(false);
                            setCredentialStep("choose");
                            setCredentialMode({ email: false, password: false });
                            setCredentialForm((prev) => ({
                              ...prev,
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            }));
                          }}
                          className="w-full rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                          <LuX className="mr-2 inline" size={16} />
                          Close
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleUpdateCredentials} className="space-y-5">
                        {credentialMode.email && (
                          <div>
                            <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                              <LuMail className="mb-1 inline" size={16} /> New email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={credentialForm.email}
                              onChange={handleCredentialChange}
                              placeholder="Enter new email"
                              className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                            <LuLock className="mb-1 inline" size={16} /> Current password
                          </label>
                          <input
                            type="password"
                            name="currentPassword"
                            value={credentialForm.currentPassword}
                            onChange={handleCredentialChange}
                            placeholder="Enter current password"
                            className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                            autoFocus
                          />
                        </div>

                        {credentialMode.password && (
                          <>
                            <div>
                              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">New password</label>
                              <input
                                type="password"
                                name="newPassword"
                                value={credentialForm.newPassword}
                                onChange={handleCredentialChange}
                                placeholder="Enter new password"
                                className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-200">Confirm new password</label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={credentialForm.confirmPassword}
                                onChange={handleCredentialChange}
                                placeholder="Re-enter new password"
                                className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
                              />
                            </div>
                          </>
                        )}

                        <div className="flex gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCredentialStep("choose");
                              setCredentialMode({ email: false, password: false });
                              setCredentialForm((prev) => ({
                                ...prev,
                                currentPassword: "",
                                newPassword: "",
                                confirmPassword: "",
                              }));
                            }}
                            disabled={credentialSaving}
                            className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={credentialSaving}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300"
                          >
                            {credentialSaving ? (
                              <>
                                <LuLoaderCircle className="animate-spin" size={16} />
                                Updating...
                              </>
                            ) : (
                              "Update"
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
