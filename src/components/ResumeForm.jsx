import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { API_BASE } from "../config.js";
import { getCookie } from "../utils/cookies";
import {
  LuUser,
  LuGraduationCap,
  LuBriefcase,
  LuFolderKanban,
  LuBrain,
  LuLanguages,
  LuBadgeCheck,
  LuPlus,
  LuTrash2,
  LuSave,
  LuEraser,
} from "react-icons/lu";

export default function ResumeForm({
  formData,
  setFormData,
  currentResumeId,
  currentTitle,
  loadResumeList,
  clearformData,
  setCurrentResumeId,
  setCurrentTitle,
}) {
  const [showNameModal, setShowNameModal] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const inputBoxStyle =
    "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 placeholder:text-stone-400";

  const textareaStyle =
    "w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 min-h-[110px] resize-y placeholder:text-stone-400";

  const labelStyle = "flex flex-col gap-2 text-sm font-semibold text-stone-700";

  const sectionCard =
    "rounded-3xl border border-stone-200 bg-stone-50 p-4 sm:p-5";

  const subCard =
    "relative rounded-2xl border border-stone-200 bg-white p-4 shadow-sm";

  const primaryButton =
    "inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600";

  const secondaryButton =
    "inline-flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50";

  const dangerIconButton =
    "absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100";

  const completionStats = useMemo(() => {
    let score = 0;
    const checks = [
      formData.name,
      formData.email,
      formData.phone,
      formData.education?.length > 0,
      formData.projects?.length > 0 || formData.experience?.length > 0,
      formData.skills,
    ];

    checks.forEach((item) => {
      if (item) score++;
    });

    return Math.round((score / checks.length) * 100);
  }, [formData]);

  function handleAddEducation() {
    const newEducation = {
      institution: "",
      year: "",
      degree: "",
      cgpa: "",
    };
    setFormData({
      ...formData,
      education: [...(formData.education || []), newEducation],
    });
  }

  function handleRemoveEducation(index) {
    const updatedEducation = (formData.education || []).filter((_, i) => i !== index);
    setFormData({ ...formData, education: updatedEducation });
  }

  function handleAddExperience() {
    const newExperience = {
      company: "",
      role: "",
      duration: "",
      responsibilities: [],
    };
    setFormData({
      ...formData,
      experience: [...(formData.experience || []), newExperience],
    });
  }

  function handleRemoveExperience(index) {
    const updatedExperience = (formData.experience || []).filter((_, i) => i !== index);
    setFormData({ ...formData, experience: updatedExperience });
  }

  function handleAddProject() {
    const newProject = {
      title: "",
      link: "",
      description: "",
      technologies: "",
    };
    setFormData({ ...formData, projects: [...(formData.projects || []), newProject] });
  }

  function handleRemoveProject(index) {
    const updatedProjects = (formData.projects || []).filter((_, i) => i !== index);
    setFormData({ ...formData, projects: updatedProjects });
  }

  function handleAddCertification() {
    const newCertification = {
      title: "",
      issuer: "",
      year: "",
      link: "",
    };
    setFormData({
      ...formData,
      certifications: [...(formData.certifications || []), newCertification],
    });
  }

  function handleRemoveCertification(index) {
    const updatedCertifications = (formData.certifications || []).filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, certifications: updatedCertifications });
  }

  function validateResume() {
    if (!formData.name?.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!formData.phone?.trim()) {
      toast.error("Phone is required");
      return false;
    }
    return true;
  }

  async function saveResume() {
    const session = getCookie("session");
    if (!session) {
      toast.error("Please login to save your resume");
      return;
    }

    if (!validateResume()) return;

    if (!currentResumeId && !tempTitle.trim()) {
      setShowNameModal(true);
      return;
    }

    const titleToSave = currentResumeId ? currentTitle || "Untitled Resume" : tempTitle;
    await actuallySaveResume(titleToSave);
  }

  async function actuallySaveResume(title) {
    const session = getCookie("session");
    if (!session) {
      toast.error("You are not logged in");
      return;
    }

    if (!title?.trim()) {
      toast.error("Please enter a resume title");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/resume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          resumeId: currentResumeId,
          title: title.trim(),
          data: formData,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.message || "Failed to save resume");
        return;
      }

      // If backend returns saved resume
      if (data?.resume?._id) {
        setCurrentResumeId?.(data.resume._id);
        setCurrentTitle?.(data.resume.title || title.trim());
        localStorage.setItem("activeResumeId", data.resume._id);
      } else {
        setCurrentTitle?.(title.trim());
      }

      toast.success(currentResumeId ? "Resume updated successfully" : "Resume saved successfully");
      setShowNameModal(false);
      setTempTitle("");
      await loadResumeList();
    } catch (error) {
      console.error("Failed to save resume:", error);
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  }

  function SectionHeader({ icon, title, subtitle }) {
    return (
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
          {icon}
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900 sm:text-xl">{title}</h2>
          {subtitle && <p className="text-xs text-stone-500 sm:text-sm">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Tips / Status */}
      <div className="mb-5 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        {/* <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              Resume Title
            </p>
            <h3 className="mt-1 text-xl font-black text-stone-900">
              {currentTitle || "Untitled Resume"}
            </h3>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-xs font-semibold text-stone-400">Completion</p>
            <p className="text-lg font-black text-stone-900">{completionStats}%</p>
          </div>
        </div> */}

        {/* <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-300"
            style={{ width: `${completionStats}%` }}
          />
        </div> */}

        <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <h4 className="text-sm font-bold text-orange-700">💡 Tips for a great resume</h4>
          <ul className="mt-2 space-y-1 text-xs text-orange-700 sm:text-sm">
            <li>• Keep bullet points concise and achievement-focused</li>
            <li>• Use role-specific keywords to improve ATS compatibility</li>
            <li>• Add projects, experience, and measurable outcomes where possible</li>
            <li>• Save often and review the live preview before downloading</li>
          </ul>
        </div>
      </div>

      <form className="space-y-5">
        {/* Personal Information */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuUser size={20} />}
            title="Personal Information"
            subtitle="Your primary contact and profile details"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className={labelStyle}>
              Name *
              <input
                className={inputBoxStyle}
                type="text"
                placeholder="Enter your full name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>

            <label className={labelStyle}>
              Email *
              <input
                className={inputBoxStyle}
                type="email"
                placeholder="Enter your email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>

            <label className={labelStyle}>
              Phone *
              <input
                className={inputBoxStyle}
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>

            <label className={labelStyle}>
              LinkedIn
              <input
                className={inputBoxStyle}
                type="url"
                placeholder="LinkedIn profile URL"
                value={formData.linkedIn || ""}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              />
            </label>

            <label className={labelStyle}>
              GitHub
              <input
                className={inputBoxStyle}
                type="url"
                placeholder="GitHub profile URL"
                value={formData.github || ""}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </label>

            <label className={labelStyle}>
              Address
              <input
                className={inputBoxStyle}
                type="text"
                placeholder="Enter your address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Education */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuGraduationCap size={20} />}
            title="Education"
            subtitle="Add your academic background"
          />

          <div className="space-y-4">
            {(formData.education || []).map((edu, index) => (
              <div key={index} className={subCard}>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(index)}
                  className={dangerIconButton}
                  title="Remove education"
                >
                  <LuTrash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className={labelStyle}>
                    Institution *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter institution name"
                      value={edu.institution || ""}
                      onChange={(e) => {
                        const updatedEducation = [...(formData.education || [])];
                        updatedEducation[index].institution = e.target.value;
                        setFormData({ ...formData, education: updatedEducation });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Year *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="e.g. 2020 - 2024"
                      value={edu.year || ""}
                      onChange={(e) => {
                        const updatedEducation = [...(formData.education || [])];
                        updatedEducation[index].year = e.target.value;
                        setFormData({ ...formData, education: updatedEducation });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Degree *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="e.g. B.Tech in Computer Science"
                      value={edu.degree || ""}
                      onChange={(e) => {
                        const updatedEducation = [...(formData.education || [])];
                        updatedEducation[index].degree = e.target.value;
                        setFormData({ ...formData, education: updatedEducation });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    CGPA / GPA
                    <input
                      className={inputBoxStyle}
                      type="number"
                      min="0"
                      max="10"
                      step="0.01"
                      placeholder="e.g. 8.5"
                      value={edu.cgpa || ""}
                      onChange={(e) => {
                        const updatedEducation = [...(formData.education || [])];
                        updatedEducation[index].cgpa = e.target.value;
                        setFormData({ ...formData, education: updatedEducation });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button className={`${secondaryButton} mt-4`} type="button" onClick={handleAddEducation}>
            <LuPlus size={16} />
            Add Education
          </button>
        </div>

        {/* Experience */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuBriefcase size={20} />}
            title="Experience"
            subtitle="Add internships, jobs, or freelance work"
          />

          <div className="space-y-4">
            {(formData.experience || []).map((exp, index) => (
              <div key={index} className={subCard}>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(index)}
                  className={dangerIconButton}
                  title="Remove experience"
                >
                  <LuTrash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className={labelStyle}>
                    Company *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter company name"
                      value={exp.company || ""}
                      onChange={(e) => {
                        const updatedExperience = [...(formData.experience || [])];
                        updatedExperience[index].company = e.target.value;
                        setFormData({ ...formData, experience: updatedExperience });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Duration *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="e.g. Jan 2023 - Present"
                      value={exp.duration || ""}
                      onChange={(e) => {
                        const updatedExperience = [...(formData.experience || [])];
                        updatedExperience[index].duration = e.target.value;
                        setFormData({ ...formData, experience: updatedExperience });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Position *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter role / position"
                      value={exp.role || ""}
                      onChange={(e) => {
                        const updatedExperience = [...(formData.experience || [])];
                        updatedExperience[index].role = e.target.value;
                        setFormData({ ...formData, experience: updatedExperience });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Responsibilities
                    <textarea
                      className={textareaStyle}
                      placeholder="Enter responsibilities (comma-separated)"
                      value={
                        Array.isArray(exp.responsibilities)
                          ? exp.responsibilities.join(", ")
                          : exp.responsibilities || ""
                      }
                      onChange={(e) => {
                        const updatedExperience = [...(formData.experience || [])];
                        updatedExperience[index].responsibilities = e.target.value
                          .split(",")
                          .map((item) => item.trim())
                          .filter(Boolean);
                        setFormData({ ...formData, experience: updatedExperience });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button className={`${secondaryButton} mt-4`} type="button" onClick={handleAddExperience}>
            <LuPlus size={16} />
            Add Experience
          </button>
        </div>

        {/* Projects */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuFolderKanban size={20} />}
            title="Projects"
            subtitle="Showcase your best work and technical projects"
          />

          <div className="space-y-4">
            {(formData.projects || []).map((project, index) => (
              <div key={index} className={subCard}>
                <button
                  type="button"
                  onClick={() => handleRemoveProject(index)}
                  className={dangerIconButton}
                  title="Remove project"
                >
                  <LuTrash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className={labelStyle}>
                    Title *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter project title"
                      value={project.title || ""}
                      onChange={(e) => {
                        const updatedProjects = [...(formData.projects || [])];
                        updatedProjects[index].title = e.target.value;
                        setFormData({ ...formData, projects: updatedProjects });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Link
                    <input
                      className={inputBoxStyle}
                      type="url"
                      placeholder="Enter project link"
                      value={project.link || ""}
                      onChange={(e) => {
                        const updatedProjects = [...(formData.projects || [])];
                        updatedProjects[index].link = e.target.value;
                        setFormData({ ...formData, projects: updatedProjects });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Technologies
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="e.g. React, Node.js, MongoDB"
                      value={project.technologies || ""}
                      onChange={(e) => {
                        const updatedProjects = [...(formData.projects || [])];
                        updatedProjects[index].technologies = e.target.value;
                        setFormData({ ...formData, projects: updatedProjects });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Description
                    <textarea
                      className={textareaStyle}
                      placeholder="Describe the project and its impact"
                      value={project.description || ""}
                      onChange={(e) => {
                        const updatedProjects = [...(formData.projects || [])];
                        updatedProjects[index].description = e.target.value;
                        setFormData({ ...formData, projects: updatedProjects });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button className={`${secondaryButton} mt-4`} type="button" onClick={handleAddProject}>
            <LuPlus size={16} />
            Add Project
          </button>
        </div>

        {/* Skills */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuBrain size={20} />}
            title="Skills"
            subtitle="List your key technical or domain skills"
          />

          <label className={labelStyle}>
            Skills (comma-separated)
            <input
              className={inputBoxStyle}
              type="text"
              placeholder="e.g. JavaScript, React, Python, SQL"
              value={formData.skills || ""}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </label>
        </div>

        {/* Languages */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuLanguages size={20} />}
            title="Languages"
            subtitle="Mention spoken or written languages"
          />

          <label className={labelStyle}>
            Languages (comma-separated)
            <input
              className={inputBoxStyle}
              type="text"
              placeholder="e.g. English, Hindi, Spanish"
              value={
                Array.isArray(formData.languages)
                  ? formData.languages.join(", ")
                  : formData.languages || ""
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  languages: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
        </div>

        {/* Certifications */}
        <div className={sectionCard}>
          <SectionHeader
            icon={<LuBadgeCheck size={20} />}
            title="Certifications"
            subtitle="Add certifications that strengthen your profile"
          />

          <div className="space-y-4">
            {(formData.certifications || []).map((cert, index) => (
              <div key={index} className={subCard}>
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(index)}
                  className={dangerIconButton}
                  title="Remove certification"
                >
                  <LuTrash2 size={16} />
                </button>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className={labelStyle}>
                    Title *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter certification title"
                      value={cert.title || ""}
                      onChange={(e) => {
                        const updatedCertifications = [...(formData.certifications || [])];
                        updatedCertifications[index].title = e.target.value;
                        setFormData({
                          ...formData,
                          certifications: updatedCertifications,
                        });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Issuer *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="Enter issuer"
                      value={cert.issuer || ""}
                      onChange={(e) => {
                        const updatedCertifications = [...(formData.certifications || [])];
                        updatedCertifications[index].issuer = e.target.value;
                        setFormData({
                          ...formData,
                          certifications: updatedCertifications,
                        });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Year *
                    <input
                      className={inputBoxStyle}
                      type="text"
                      placeholder="e.g. 2024"
                      value={cert.year || ""}
                      onChange={(e) => {
                        const updatedCertifications = [...(formData.certifications || [])];
                        updatedCertifications[index].year = e.target.value;
                        setFormData({
                          ...formData,
                          certifications: updatedCertifications,
                        });
                      }}
                    />
                  </label>

                  <label className={labelStyle}>
                    Link
                    <input
                      className={inputBoxStyle}
                      type="url"
                      placeholder="Certification URL"
                      value={cert.link || ""}
                      onChange={(e) => {
                        const updatedCertifications = [...(formData.certifications || [])];
                        updatedCertifications[index].link = e.target.value;
                        setFormData({
                          ...formData,
                          certifications: updatedCertifications,
                        });
                      }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`${secondaryButton} mt-4`}
            type="button"
            onClick={handleAddCertification}
          >
            <LuPlus size={16} />
            Add Certification
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 z-10 rounded-3xl border border-stone-200 bg-white p-4 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={saveResume}
              disabled={isSaving}
              className={`${primaryButton} justify-center sm:justify-start ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <LuSave size={16} />
              {isSaving ? "Saving..." : "Save Resume"}
            </button>

            <button
              type="button"
              onClick={clearformData}
              className={`${secondaryButton} justify-center sm:justify-start`}
            >
              <LuEraser size={16} />
              Clear Form
            </button>
          </div>
        </div>
      </form>

      {/* Name Resume Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black text-stone-900">Name your resume</h3>
            <p className="mt-1 text-sm text-stone-500">
              Give this resume a title so you can find it later.
            </p>

            <input
              type="text"
              placeholder="e.g. Frontend Developer Resume"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              className="mt-4 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              autoFocus
            />

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => {
                  setShowNameModal(false);
                  setTempTitle("");
                }}
                className="rounded-2xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>

              <button
                onClick={() => actuallySaveResume(tempTitle)}
                disabled={isSaving}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-70"
              >
                {isSaving ? "Saving..." : "Save Resume"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}