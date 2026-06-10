import { useEffect, useMemo, useState } from "react";
import { API_BASE } from "../config";
import {
  LuUser,
  LuMail,
  LuPhone,
  LuMapPin,
  LuBriefcase,
  LuSave,
  LuTrash2,
  LuBadgeCheck,
  LuTriangleAlert,
  LuLoaderCircle,
  LuLock,
  LuCheck,
  LuX,
  LuPencil,
} from "react-icons/lu";
import { clearAuthState, deleteCookie, getCookie, setCookie } from "../utils/cookies";

export default function ProfilePage() {
  const role = getCookie("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    headline: "",
    experience: "fresher",
    bio: "",
    preferredJobTypes: [],
    preferredWorkModes: [],
    preferredLocations: "",
  });

  const [originalForm, setOriginalForm] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  // View/Edit mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAction, setPasswordAction] = useState(null); // "save" | "delete"

  // Credentials update modal
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

  const jobTypeOptions = ["Full-Time", "Part-Time", "Internship", "Contract", "Freelance"];
  const workModeOptions = ["On-site", "Remote", "Hybrid"];

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    if (role === "employer") return;
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
        showToast(data?.message || "Failed to load profile", "error");
        return;
      }

      const profileData = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        headline: data.headline || "",
        experience: data.experience || "fresher",
        bio: data.bio || "",
        preferredJobTypes: Array.isArray(data.preferredJobTypes) ? data.preferredJobTypes : [],
        preferredWorkModes: Array.isArray(data.preferredWorkModes) ? data.preferredWorkModes : [],
        preferredLocations: data.preferredLocations || "",
      };

      setForm(profileData);
      setOriginalForm(profileData);
      setCredentialForm((prev) => ({ ...prev, email: profileData.email || "" }));
    } catch (error) {
      console.error(error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
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
      showToast("Current password is required", "error");
      return;
    }

    const emailChanged =
      credentialMode.email &&
      trimmedEmail &&
      trimmedEmail.toLowerCase() !== (form.email || "").toLowerCase();

    const wantsPasswordChange = credentialMode.password && Boolean(trimmedNewPassword);

    if (wantsPasswordChange) {
      if (trimmedNewPassword.length < 6) {
        showToast("New password must be at least 6 characters", "error");
        return;
      }
      if (trimmedNewPassword !== trimmedConfirm) {
        showToast("New password and confirmation do not match", "error");
        return;
      }
    }

    if (!emailChanged && !wantsPasswordChange) {
      showToast("No credential changes to update", "error");
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
        showToast(data?.message || "Failed to update credentials", "error");
        return;
      }

      if (data?.user?.email) {
        setForm((prev) => ({ ...prev, email: data.user.email }));
        setOriginalForm((prev) => (prev ? { ...prev, email: data.user.email } : prev));
        setCookie("email", data.user.email);
        setCredentialForm((prev) => ({ ...prev, email: data.user.email }));
      }

      setCredentialForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));

      showToast(data?.message || "Credentials updated successfully", "success");
      setShowCredentialModal(false);
      setCredentialStep("choose");
      setCredentialMode({ email: false, password: false });
    } catch (error) {
      console.error(error);
      showToast("Failed to update credentials", "error");
    } finally {
      setCredentialSaving(false);
    }
  }

  function handleChange(e) {
    if (!isEditMode) return;
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleArrayField(field, value) {
    if (!isEditMode) return;

    setForm((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);

      return {
        ...prev,
        [field]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
  }

  const completion = useMemo(() => {
    const checks = [
      !!form.name,
      !!form.email,
      !!form.phone,
      !!form.city,
      !!form.headline,
      !!form.bio,
      form.preferredJobTypes.length > 0,
      form.preferredWorkModes.length > 0,
    ];

    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  function openSaveModal() {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setPasswordAction("save");
    setPasswordInput("");
    setShowPasswordModal(true);
  }

  function openDeleteModal() {
    setPasswordAction("delete");
    setPasswordInput("");
    setShowPasswordModal(true);
  }

  async function confirmPasswordAction(password) {
    if (!password.trim()) {
      showToast("Password is required", "error");
      return;
    }

    setPasswordLoading(true);

    try {
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
          showToast(data?.message || "Failed to update profile", "error");
          return;
        }

        const updatedForm = {
          ...form,
        };

        setOriginalForm(updatedForm);
        setCookie("name", data.user?.name || form.name);
        if (data.user?.email) setCookie("email", data.user.email);
        showToast(data?.message || "Profile updated successfully!", "success");

        setIsEditMode(false);
        setShowPasswordModal(false);
        setPasswordInput("");
      }

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
          showToast(data?.message || "Failed to delete account", "error");
          return;
        }

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
      }
    } catch (error) {
      console.error(error);
      showToast(
        passwordAction === "save" ? "Failed to update profile" : "Failed to delete account",
        "error"
      );
    } finally {
      setPasswordLoading(false);
      setSaving(false);
      setDeleting(false);
    }
  }

  function handleCancelEdit() {
    if (originalForm) {
      setForm(originalForm);
    }
    setIsEditMode(false);
  }

  function getInputClass(disabled = false) {
    if (disabled) {
      return "w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500";
    }

    return `w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
      isEditMode
        ? "border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        : "border-stone-200 bg-white text-stone-700"
    }`;
  }

  function getFieldClassWithIcon() {
    return `w-full rounded-2xl border bg-white px-4 py-3 pl-11 text-sm outline-none transition ${
      isEditMode
        ? "border-stone-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        : "border-stone-200 text-stone-700"
    }`;
  }

  if (role === "employer") {
    return (
      <div className="min-h-screen bg-stone-100 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-black text-stone-900">Wrong profile page</h1>
          <p className="mt-2 text-sm text-stone-600">
            Employer accounts should use the company profile page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
          <LuLoaderCircle className="animate-spin text-orange-500" />
          <span className="text-sm font-semibold text-stone-700">Loading profile...</span>
        </div>
      </div>
    );
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

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-stone-900">My Profile</h1>
            <p className="mt-2 text-sm text-stone-500">
              {isEditMode
                ? "Edit your personal details and job preferences"
                : "View your personal details and job preferences"}
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-2xl font-black text-white">
                  {(form.name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900">{form.name || "User"}</h2>
                  <p className="text-sm text-stone-500">Candidate Account</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-stone-700">Profile Completion</span>
                  <span className="font-bold text-orange-600">{completion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Sign-in Credentials */}
            <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-stone-900">Sign-in Credentials</h3>
              <p className="mt-2 text-xs leading-6 text-stone-500">
                Update your sign-in email or password. Current password is required.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCredentialStep("choose");
                  setCredentialMode({ email: false, password: false });
                  setShowCredentialModal(true);
                }}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50"
              >
                <LuLock size={16} />
                Update credentials
              </button>
            </div>

            <div className="rounded-3xl border border-red-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-black text-stone-900">Danger Zone</h3>
              <p className="mt-2 text-xs leading-6 text-stone-500">
                Deleting your account may remove your profile, resumes, and application history.
              </p>
              <button
                onClick={openDeleteModal}
                disabled={deleting || passwordLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-70"
              >
                <LuTrash2 size={16} />
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Full Name"
                icon={<LuUser />}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                isEditMode={isEditMode}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold text-stone-700">Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <LuMail />
                  </div>
                  <input
                    value={form.email}
                    disabled
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pl-11 text-sm text-stone-500"
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  Use Sign-in Credentials to update your email
                </p>
              </div>

              <Field
                label="Phone"
                icon={<LuPhone />}
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                isEditMode={isEditMode}
              />

              <Field
                label="City"
                icon={<LuMapPin />}
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                isEditMode={isEditMode}
              />
            </div>

            <Field
              label="Professional Headline"
              icon={<LuBriefcase />}
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="e.g. Frontend Developer | React Enthusiast"
              isEditMode={isEditMode}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Experience</label>
              <select
                name="experience"
                value={form.experience}
                onChange={handleChange}
                disabled={!isEditMode}
                className={getInputClass(!isEditMode)}
              >
                <option value="fresher">Fresher</option>
                <option value="1-3">1–3 yrs</option>
                <option value="3-5">3–5 yrs</option>
                <option value="5+">5+ yrs</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                readOnly={!isEditMode}
                rows="5"
                placeholder="Write a short summary about yourself..."
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                  isEditMode
                    ? "border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    : "border-stone-200 bg-white text-stone-700"
                }`}
              />
            </div>

            <PreferenceGroup
              title="Preferred Job Types"
              options={jobTypeOptions}
              values={form.preferredJobTypes}
              onToggle={(value) => toggleArrayField("preferredJobTypes", value)}
              isEditMode={isEditMode}
            />

            <PreferenceGroup
              title="Preferred Work Modes"
              options={workModeOptions}
              values={form.preferredWorkModes}
              onToggle={(value) => toggleArrayField("preferredWorkModes", value)}
              isEditMode={isEditMode}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-stone-700">
                Preferred Locations
              </label>
              <input
                name="preferredLocations"
                value={form.preferredLocations}
                onChange={handleChange}
                readOnly={!isEditMode}
                placeholder="e.g. Bengaluru, Remote, Hyderabad"
                className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition ${
                  isEditMode
                    ? "border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    : "border-stone-200 bg-white text-stone-700"
                }`}
              />
            </div>

            {/* Action Buttons only in edit mode */}
            {isEditMode && (
              <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-stone-50 px-6 py-5">
                <p className="text-sm text-stone-600">
                  Make sure all information is accurate before saving.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="rounded-xl border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:bg-stone-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={openSaveModal}
                    disabled={saving || passwordLoading}
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-stone-300"
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
          </div>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div
                className={`rounded-full p-3 ${
                  passwordAction === "delete"
                    ? "bg-red-100 text-red-600"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                <LuLock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900">Confirm Password</h3>
                <p className="text-sm text-stone-500">
                  {passwordAction === "delete"
                    ? "Enter your password to permanently delete your account"
                    : "Enter your password to save changes"}
                </p>
              </div>
            </div>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && confirmPasswordAction(passwordInput)
              }
              placeholder="Enter your password"
              className="mb-6 w-full rounded-xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                  setPasswordAction(null);
                }}
                disabled={passwordLoading}
                className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LuX className="mr-2 inline" size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={() => confirmPasswordAction(passwordInput)}
                disabled={passwordLoading || !passwordInput.trim()}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300 ${
                  passwordAction === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {passwordLoading ? (
                  <>
                    <LuLoaderCircle className="animate-spin" size={16} />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LuCheck size={16} />
                    {passwordAction === "delete" ? "Delete Account" : "Confirm"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Update Modal */}
      {showCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                <LuLock size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-stone-900">Update credentials</h3>
                <p className="mt-1 text-sm text-stone-500">
                  Current password is required to confirm changes.
                </p>
              </div>
            </div>

            {credentialStep === "choose" ? (
              <div className="space-y-5">
                <p className="text-sm text-stone-600">What would you like to change?</p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCredentialMode({ email: true, password: false });
                      setCredentialStep("form");
                    }}
                    className="rounded-2xl border border-stone-200 p-5 text-left transition hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2 font-semibold text-stone-900">
                      <LuMail size={16} /> Change email
                    </div>
                    <p className="mt-1 text-sm text-stone-500">Update the email used to sign in.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCredentialMode({ email: false, password: true });
                      setCredentialStep("form");
                    }}
                    className="rounded-2xl border border-stone-200 p-5 text-left transition hover:bg-stone-50"
                  >
                    <div className="flex items-center gap-2 font-semibold text-stone-900">
                      <LuLock size={16} /> Change password
                    </div>
                    <p className="mt-1 text-sm text-stone-500">Set a new password for your account.</p>
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
                  className="w-full rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100"
                >
                  <LuX className="mr-2 inline" size={16} />
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdateCredentials} className="space-y-5">
                {credentialMode.email && (
                  <div>
                    <label className="block text-sm font-semibold text-stone-700">
                      <LuMail className="mb-1 inline" size={16} /> New email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={credentialForm.email}
                      onChange={handleCredentialChange}
                      placeholder="Enter new email"
                      className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-stone-700">
                    <LuLock className="mb-1 inline" size={16} /> Current password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={credentialForm.currentPassword}
                    onChange={handleCredentialChange}
                    placeholder="Enter current password"
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                    autoFocus
                  />
                </div>

                {credentialMode.password && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700">New password</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={credentialForm.newPassword}
                        onChange={handleCredentialChange}
                        placeholder="Enter new password"
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-stone-700">Confirm new password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={credentialForm.confirmPassword}
                        onChange={handleCredentialChange}
                        placeholder="Re-enter new password"
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200"
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
                    className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}

function Field({
  label,
  icon,
  name,
  value,
  onChange,
  placeholder = "",
  isEditMode = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-stone-700">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
          {icon}
        </div>
        <input
          name={name}
          value={value}
          onChange={onChange}
          readOnly={!isEditMode}
          placeholder={placeholder}
          className={`w-full rounded-2xl border px-4 py-3 pl-11 text-sm outline-none transition ${
            isEditMode
              ? "border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              : "border-stone-200 bg-white text-stone-700"
          }`}
        />
      </div>
    </div>
  );
}

function PreferenceGroup({ title, options, values, onToggle, isEditMode = false }) {
  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-stone-700">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = values.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-stone-200 bg-white text-stone-600"
              } ${isEditMode ? "hover:border-orange-200 cursor-pointer" : "cursor-default"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}