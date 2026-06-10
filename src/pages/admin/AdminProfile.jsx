import { useEffect, useState } from "react";
import { API_BASE } from "../../config";
import { getCookie, setCookie } from "../../utils/cookies";
import {
  LuBadgeCheck,
  LuLoaderCircle,
  LuLock,
  LuMail,
  LuMapPin,
  LuPencil,
  LuPhone,
  LuSave,
  LuShield,
  LuTriangleAlert,
  LuUser,
  LuX,
} from "react-icons/lu";

export default function AdminProfile() {
  const role = getCookie("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [originalForm, setOriginalForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [credentialForm, setCredentialForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [credentialMode, setCredentialMode] = useState({ email: false, password: false });
  const [credentialStep, setCredentialStep] = useState("choose");
  const [credentialSaving, setCredentialSaving] = useState(false);
  const [showCredentialModal, setShowCredentialModal] = useState(false);

  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    if (role !== "admin") return;
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

      const next = {
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
      };

      setForm(next);
      setOriginalForm(next);
      setCredentialForm((prev) => ({ ...prev, email: next.email }));
    } catch (error) {
      console.error(error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    if (!isEditMode) return;
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function openSaveModal() {
    if (!form.name.trim()) {
      showToast("Name is required", "error");
      return;
    }

    setPasswordInput("");
    setShowPasswordModal(true);
  }

  async function confirmProfileUpdate() {
    const password = passwordInput.trim();
    if (!password) {
      showToast("Password is required", "error");
      return;
    }

    setPasswordLoading(true);
    setSaving(true);

    try {
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

      if (!res.ok || !data) {
        showToast(data?.message || "Failed to update profile", "error");
        return;
      }

      const updated = {
        ...form,
        name: data?.user?.name || form.name,
      };

      setForm(updated);
      setOriginalForm(updated);
      setCookie("name", updated.name);

      showToast(data?.message || "Profile updated successfully", "success");
      setShowPasswordModal(false);
      setPasswordInput("");
      setIsEditMode(false);
    } catch (error) {
      console.error(error);
      showToast("Failed to update profile", "error");
    } finally {
      setPasswordLoading(false);
      setSaving(false);
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

  if (role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="rounded-3xl border border-red-200 bg-white p-8 dark:border-red-900/50 dark:bg-stone-900">
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Access Denied</h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
            Only admins can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
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

      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <LuLoaderCircle className="animate-spin text-orange-500" />
            <span className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Loading profile...
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-stone-900 dark:text-stone-50">Admin Profile</h1>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                View and manage your administrator account details.
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
            <aside className="space-y-6">
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-2xl font-black text-white">
                    {(form.name || "A").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-stone-900 dark:text-stone-50">{form.name || "Admin"}</h2>
                    <p className="text-sm text-stone-500 dark:text-stone-400">Administrator</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/40">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
                    <LuShield size={16} />
                    Privileged account
                  </div>
                  <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                    Role and moderation permissions are managed system-wide.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <h3 className="text-sm font-black text-stone-900 dark:text-stone-50">Sign-in Credentials</h3>
                <p className="mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400">
                  Update your login email or password. Current password is required.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCredentialStep("choose");
                    setCredentialMode({ email: false, password: false });
                    setShowCredentialModal(true);
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:border-stone-800 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  <LuLock size={16} />
                  Update credentials
                </button>
              </div>
            </aside>

            <div className="space-y-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8 dark:border-stone-800 dark:bg-stone-900">
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
                <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
                  Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                    <LuMail />
                  </div>
                  <input
                    value={form.email}
                    disabled
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 pl-11 text-sm text-stone-500 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                  />
                </div>
                <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                  Use Sign-in Credentials to update your email.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

              {isEditMode && (
                <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-stone-50 px-6 py-5 dark:border-stone-800 dark:bg-stone-950/40">
                  <p className="text-sm text-stone-600 dark:text-stone-300">
                    Confirm with your password to save profile updates.
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (originalForm) setForm(originalForm);
                        setIsEditMode(false);
                      }}
                      className="rounded-xl border border-stone-300 px-6 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={openSaveModal}
                      disabled={saving || passwordLoading}
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
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-lg dark:border-stone-800 dark:bg-stone-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-3 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                <LuLock size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">Confirm Password</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  Enter your password to save profile changes.
                </p>
              </div>
            </div>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmProfileUpdate()}
              placeholder="Enter your password"
              className="mb-6 w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordInput("");
                }}
                disabled={passwordLoading}
                className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <LuX className="mr-2 inline" size={16} />
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmProfileUpdate}
                disabled={passwordLoading || !passwordInput.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-stone-700"
              >
                {passwordLoading ? (
                  <>
                    <LuLoaderCircle className="animate-spin" size={16} />
                    Verifying...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCredentialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
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
                      className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
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
                    className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
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
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
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
                        className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-1 focus:ring-orange-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
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
                    className="flex-1 rounded-xl border border-stone-300 px-4 py-3 font-semibold text-stone-700 transition hover:bg-stone-100 disabled:opacity-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={credentialSaving}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:bg-stone-300 dark:disabled:bg-stone-700"
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
      <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">{label}</label>
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
              ? "border-stone-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/20"
              : "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-200"
          }`}
        />
      </div>
    </div>
  );
}
