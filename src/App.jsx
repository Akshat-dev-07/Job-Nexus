import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";
import "./App.css";
import PDFDownloadButton from "./components/PDFDownloadButton.jsx";
import { details } from "./Data.js";
import { API_BASE } from "./config.js";
import { getCookie } from "./utils/cookies.js";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "./components/Modals/DeleteConfirmationModal.jsx";
import {
  LuFileText,
  LuDownload,
  LuFolderOpen,
  LuPencil,
  LuTrash2,
  LuPlus,
  LuChevronDown,
  LuX,
  LuEye,
} from "react-icons/lu";

const App = () => {
  const navigate = useNavigate();
  const componentRef = useRef();

  const emptyResume = {
    layout: "classic",
    name: "",
    email: "",
    phone: "",
    linkedIn: "",
    github: "",
    address: "",
    education: [],
    experience: [],
    projects: [],
    skills: "",
    languages: [],
    certifications: [],
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [resumeList, setResumeList] = useState([]);
  const [formData, setFormData] = useState(details || emptyResume);

  const [currentResumeId, setCurrentResumeId] = useState(null);
  const [currentTitle, setCurrentTitle] = useState("");
  const [deleteResumeId, setDeleteResumeId] = useState(null);
  const [renameResumeId, setRenameResumeId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState(false);

  const isLoggedIn = Boolean(getCookie("session"));
  const role = getCookie("role");

  const selectedLayout =
    typeof formData?.layout === "string" && formData.layout.trim()
      ? formData.layout.trim().toLowerCase()
      : "classic";

  function setResumeLayout(layout) {
    setFormData((prev) => ({
      ...(prev || emptyResume),
      layout,
    }));
  }

  /* ================= LOAD RESUMES ================= */

  async function loadResumeList() {
    if (!isLoggedIn) return;

    try {
      const res = await fetch(`${API_BASE}/api/resumes`, {
        credentials: "include",
      });

      const data = await res.json();
      setResumeList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load resumes:", error);
      toast.error("Failed to load resumes");
      setResumeList([]);
    }
  }

  async function loadSingleResume(resumeId) {
    if (!isLoggedIn) return;

    try {
      const res = await fetch(`${API_BASE}/api/resume/${resumeId}`, {
        credentials: "include",
      });

      const resume = await res.json();

      if (!res.ok) {
        toast.error(resume?.message || "Failed to load resume");
        return;
      }

      if (resume) {
        setCurrentResumeId(resume._id);
        setCurrentTitle(resume.title || "Untitled Resume");
        setFormData({
          ...emptyResume,
          ...(resume.data || {}),
        });
        localStorage.setItem("activeResumeId", resumeId);
        setIsDropdownOpen(false);
        toast.success("Resume loaded");
      }
    } catch (error) {
      console.error("Failed to load single resume:", error);
      toast.error("Failed to load resume");
    }
  }

  /* ================= RENAME & DELETE ================= */

  async function renameResume(resumeId, newTitle) {
    if (!newTitle.trim()) {
      toast.error("Resume title cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/resume/${resumeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      if (!res.ok) {
        toast.error("Failed to rename resume");
        return;
      }

      if (resumeId === currentResumeId) {
        setCurrentTitle(newTitle.trim());
      }

      setRenameResumeId(null);
      setRenameValue("");
      await loadResumeList();
      toast.success("Resume renamed");
    } catch (error) {
      console.error("Failed to rename resume:", error);
      toast.error("Failed to rename resume");
    }
  }

  async function deleteResume(resumeId) {
    try {
      const res = await fetch(`${API_BASE}/api/resume/${resumeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        toast.error("Failed to delete resume");
        return;
      }

      if (resumeId === currentResumeId) {
        setFormData(emptyResume);
        setCurrentResumeId(null);
        setCurrentTitle("");
        localStorage.removeItem("activeResumeId");
      }

      setDeleteResumeId(null);
      setShowDeleteConfirmationModal(false);
      await loadResumeList();
      toast.success("Resume deleted");
    } catch (error) {
      console.error("Failed to delete resume:", error);
      toast.error("Failed to delete resume");
    }
  }

  function createNewResume() {
    setFormData(emptyResume);
    setCurrentResumeId(null);
    setCurrentTitle("");
    localStorage.removeItem("activeResumeId");
    setIsDropdownOpen(false);
    toast.success("Started a new resume");
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadResumeList();

      const activeResumeId = localStorage.getItem("activeResumeId");
      if (activeResumeId) {
        loadSingleResume(activeResumeId);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest(".resume-dropdown-wrapper")) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  function clearformData() {
    setFormData(emptyResume);
    toast.success("Form cleared");
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/80">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
                <LuFileText size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-stone-900 sm:text-3xl">
                  Resume Builder
                </h1>
                <p className="text-sm text-stone-500">
                  Create, save, preview, and export ATS-friendly resumes
                </p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* PDF Download */}
              {formData.name ? (
                <div className="inline-flex">
                  <PDFDownloadButton formData={formData} />
                </div>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-400 cursor-not-allowed"
                  disabled
                >
                  <LuDownload size={16} />
                  Download PDF
                </button>
              )}

              {/* New Resume */}
              <button
                onClick={createNewResume}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                <LuPlus size={16} />
                New Resume
              </button>

              {/* My Resumes */}
              {isLoggedIn && (
                <div className="relative resume-dropdown-wrapper">
                  <button
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50"
                  >
                    <LuFolderOpen size={16} />
                    My Resumes
                    <LuChevronDown
                      size={16}
                      className={`transition ${isDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 top-[110%] z-50 w-[320px] overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-2xl">
                      <div className="border-b border-stone-100 px-4 py-3">
                        <h3 className="text-sm font-bold text-stone-900">
                          Saved Resumes
                        </h3>
                        <p className="text-xs text-stone-500">
                          Open, rename, or delete your resumes
                        </p>
                      </div>

                      {resumeList.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-stone-500">
                          No resumes saved yet
                        </div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {resumeList.map((resume) => (
                            <div
                              key={resume._id}
                              className="border-b border-stone-100 px-4 py-3 last:border-b-0"
                            >
                              {renameResumeId === resume._id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                                    autoFocus
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      className="rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700"
                                      onClick={() =>
                                        renameResume(resume._id, renameValue)
                                      }
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                                      onClick={() => {
                                        setRenameResumeId(null);
                                        setRenameValue("");
                                      }}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => loadSingleResume(resume._id)}
                                    className="block w-full text-left"
                                  >
                                    <p className="font-semibold text-stone-900 hover:text-orange-600">
                                      {resume.title || "Untitled Resume"}
                                    </p>
                                    <p className="mt-1 text-xs text-stone-500">
                                      {resume.updatedAt
                                        ? `Updated ${new Date(
                                            resume.updatedAt
                                          ).toLocaleDateString("en-IN")}`
                                        : "Saved resume"}
                                    </p>
                                  </button>

                                  <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                      onClick={() => loadSingleResume(resume._id)}
                                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                                    >
                                      <LuEye size={14} />
                                      Open
                                    </button>

                                    <button
                                      onClick={() => {
                                        setRenameResumeId(resume._id);
                                        setRenameValue(
                                          resume.title || "Untitled Resume"
                                        );
                                      }}
                                      className="inline-flex items-center gap-1 rounded-xl border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                                    >
                                      <LuPencil size={14} />
                                      Rename
                                    </button>

                                    <button
                                      onClick={() => {
                                        setDeleteResumeId(resume._id);
                                        setShowDeleteConfirmationModal(true);
                                      }}
                                      className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                                    >
                                      <LuTrash2 size={14} />
                                      Delete
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Optional Back CTA for employers */}
              {role === "employer" && (
                <button
                  onClick={() => navigate("/employer-dashboard")}
                  className="inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Top Summary */}
        <section className="mb-6 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                Current Resume
              </p>
              <h2 className="mt-1 text-2xl font-black text-stone-900">
                {currentTitle || "Untitled Resume"}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Changes are reflected live in the preview panel
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold text-stone-400">Saved Resumes</p>
                <p className="text-lg font-black text-stone-900">{resumeList.length}</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-xs font-semibold text-stone-400">Preview</p>
                <p className="text-lg font-black text-stone-900">Live</p>
              </div>
            </div>
          </div>
        </section>

        {/* Builder Layout */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Form */}
          <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <h3 className="text-lg font-black text-stone-900">Edit Resume</h3>
              <p className="text-sm text-stone-500">
                Fill your details and save your resume anytime
              </p>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4 sm:p-5">
              <ResumeForm
                formData={formData}
                setFormData={setFormData}
                currentResumeId={currentResumeId}
                currentTitle={currentTitle}
                loadResumeList={loadResumeList}
                clearformData={clearformData}
                setCurrentResumeId={setCurrentResumeId}
                setCurrentTitle={setCurrentTitle}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-5 py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-black text-stone-900">Live Preview</h3>
                  <p className="text-sm text-stone-500">
                    See how your resume looks before downloading
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                    Layout
                  </span>
                  <div className="inline-flex rounded-2xl border border-stone-200 bg-stone-50 p-1">
                    {[
                      { key: "classic", label: "Classic" },
                      { key: "modern", label: "Modern" },
                      { key: "minimal", label: "Minimal" },
                    ].map((opt) => {
                      const active = selectedLayout === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setResumeLayout(opt.key)}
                          className={`rounded-2xl px-3 py-2 text-xs font-bold transition sm:text-sm ${
                            active
                              ? "bg-orange-500 text-white"
                              : "text-stone-700 hover:bg-white"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div
              ref={componentRef}
              className="max-h-[calc(100vh-220px)] overflow-y-auto bg-stone-50 p-4 sm:p-6"
            >
              <div className="mx-auto max-w-[850px] rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
                <ResumePreview formData={formData} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Single Correct Delete Modal */}
      {showDeleteConfirmationModal && deleteResumeId !== null && (
        <DeleteConfirmationModal
          setShowDeleteConfirmationModal={setShowDeleteConfirmationModal}
          setDeleteResumeId={setDeleteResumeId}
          message="Do you want to delete this resume permanently?"
          onDelete={() => {
            deleteResume(deleteResumeId);
          }}
        />
      )}
    </div>
  );
};

export default App;