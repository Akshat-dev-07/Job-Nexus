import "../App.css";
import { FaExternalLinkAlt, FaLinkedin, FaGithubSquare } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { LuMapPin } from "react-icons/lu";

export default function ResumePreview({ formData }) {
  const selectedLayout =
    typeof formData?.layout === "string" && formData.layout.trim()
      ? formData.layout.trim().toLowerCase()
      : "classic";

  const hasExperience = formData.experience && formData.experience.length > 0;
  const hasEducation = Array.isArray(formData.education) && formData.education.length > 0;
  const hasProjects = Array.isArray(formData.projects) && formData.projects.length > 0;
  const hasCertifications =
    Array.isArray(formData.certifications) && formData.certifications.length > 0;
  const languagesText = Array.isArray(formData.languages)
    ? formData.languages.join(", ")
    : formData.languages || "";

  function ContactPills() {
    return (
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-medium text-stone-600 sm:gap-4 sm:text-sm">
        {formData.email && (
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
            <MdEmail className="text-blue-500" />
            <a href={`mailto:${formData.email}`} className="break-all">
              {formData.email}
            </a>
          </div>
        )}

        {formData.phone && (
          <div className="flex items-center gap-1.5 transition-colors hover:text-green-600">
            <IoCall className="text-green-500" />
            <a href={`tel:${formData.phone}`}>{formData.phone}</a>
          </div>
        )}

        {formData.linkedIn && (
          <div className="flex items-center gap-1.5 transition-colors hover:text-blue-700">
            <a
              href={formData.linkedIn}
              className="flex items-center gap-1.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <FaLinkedin className="text-blue-600" />
            </a>
          </div>
        )}

        {formData.github && (
          <div className="flex items-center gap-1.5 transition-colors hover:text-stone-900">
            <a
              href={formData.github}
              className="flex items-center gap-1.5"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub <FaGithubSquare className="text-stone-700" />
            </a>
          </div>
        )}
      </div>
    );
  }

  function SectionTitle({ children }) {
    return (
      <h2 className="mb-3 border-b border-stone-300 pb-2 text-lg font-black text-stone-900 sm:text-xl">
        {children}
      </h2>
    );
  }

  function Card({ children }) {
    return <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">{children}</div>;
  }

  function ClassicLayout() {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white">
          {/* Header */}
          <div className="border-b-2 border-stone-200 pb-5 text-center">
            <h1 className="text-3xl font-black text-stone-900 sm:text-4xl">
              {formData.name || "Your Name"}
            </h1>

            <ContactPills />

            {formData.address && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-stone-500">
                <LuMapPin className="text-orange-500" />
                <span>{formData.address}</span>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-6">
            {/* Education */}
            {hasEducation && (
              <section>
                <SectionTitle>Education</SectionTitle>
                <div className="space-y-3">
                  {formData.education.map((edu, index) => (
                    <Card key={index}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-base font-bold text-stone-900">{edu.institution}</h3>
                        <p className="text-sm font-semibold text-stone-500">{edu.year}</p>
                      </div>

                      <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-stone-700">{edu.degree}</p>
                        {edu.cgpa && (
                          <p className="text-sm font-medium text-stone-500">CGPA: {edu.cgpa}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {hasProjects && (
              <section>
                <SectionTitle>Projects</SectionTitle>
                <div className="space-y-4">
                  {formData.projects.map((project, index) => (
                    <Card key={index}>
                      <h3 className="text-base font-bold text-stone-900 sm:text-lg">
                        {project.title}
                      </h3>

                      {project.description && (
                        <p className="mt-2 text-sm leading-6 text-stone-700 sm:text-base">
                          {project.description}
                        </p>
                      )}

                      {project.technologies && (
                        <p className="mt-2 text-sm italic text-stone-500">
                          <span className="font-semibold not-italic text-stone-700">
                            Technologies:
                          </span>{" "}
                          {project.technologies}
                        </p>
                      )}

                      {project.link && (
                        <a
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800"
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Project Link <FaExternalLinkAlt className="text-xs" />
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {hasExperience && (
              <section>
                <SectionTitle>Experience</SectionTitle>
                <div className="space-y-4">
                  {formData.experience.map((exp, index) => (
                    <Card key={index}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <h3 className="text-base font-bold text-stone-900 sm:text-lg">
                          {exp.company}
                        </h3>
                        <p className="text-sm font-medium text-stone-500">{exp.duration}</p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-stone-700 sm:text-base">
                        {exp.role}
                      </p>

                      {exp.responsibilities && (
                        <div className="mt-3">
                          {Array.isArray(exp.responsibilities) ? (
                            <ul className="list-disc space-y-1 pl-5">
                              {exp.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex} className="text-sm leading-6 text-stone-700">
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm leading-6 text-stone-700">{exp.responsibilities}</p>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {(formData.skills || languagesText) && (
              <section>
                <SectionTitle>Skills</SectionTitle>
                <Card>
                  <div className="space-y-4">
                    {formData.skills && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-stone-900 sm:text-base">
                          Technical Skills
                        </h3>
                        <p className="text-sm leading-6 text-stone-700 sm:text-base">
                          {formData.skills}
                        </p>
                      </div>
                    )}

                    {languagesText && (
                      <div>
                        <h3 className="mb-2 text-sm font-bold text-stone-900 sm:text-base">
                          Languages
                        </h3>
                        <p className="text-sm text-stone-700 sm:text-base">{languagesText}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </section>
            )}

            {/* Certifications */}
            {hasCertifications && (
              <section>
                <SectionTitle>Certifications</SectionTitle>
                <div className="space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <Card key={index}>
                      <h3 className="text-sm font-bold text-stone-900 sm:text-base">{cert.title}</h3>

                      <p className="mt-1 text-sm text-stone-700">{cert.issuer}</p>

                      <p className="mt-1 text-sm text-stone-500">{cert.year}</p>

                      {cert.link && (
                        <a
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800"
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Certification Link <FaExternalLinkAlt className="text-xs" />
                        </a>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  function ModernLayout() {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white">
          <div className="border-b border-stone-200 pb-5">
            <h1 className="text-3xl font-black text-stone-900 sm:text-4xl">{formData.name || "Your Name"}</h1>
            <div className="mt-2 text-sm text-stone-500">
              {formData.address ? (
                <div className="flex items-center gap-1.5">
                  <LuMapPin className="text-orange-500" />
                  <span>{formData.address}</span>
                </div>
              ) : null}
            </div>

            <div className="mt-3">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-stone-600 sm:text-sm">
                {formData.email ? (
                  <a className="inline-flex items-center gap-1.5 hover:text-blue-600" href={`mailto:${formData.email}`}>
                    <MdEmail className="text-blue-500" />
                    <span className="break-all">{formData.email}</span>
                  </a>
                ) : null}
                {formData.phone ? (
                  <a className="inline-flex items-center gap-1.5 hover:text-green-600" href={`tel:${formData.phone}`}>
                    <IoCall className="text-green-500" />
                    <span>{formData.phone}</span>
                  </a>
                ) : null}
                {formData.linkedIn ? (
                  <a
                    className="inline-flex items-center gap-1.5 hover:text-blue-700"
                    href={formData.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    LinkedIn <FaLinkedin className="text-blue-600" />
                  </a>
                ) : null}
                {formData.github ? (
                  <a
                    className="inline-flex items-center gap-1.5 hover:text-stone-900"
                    href={formData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub <FaGithubSquare className="text-stone-700" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Sidebar */}
            <aside className="md:col-span-4">
              <div className="space-y-4">
                {(formData.skills || languagesText) && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <h2 className="text-sm font-black text-stone-900">Skills</h2>
                    {formData.skills ? (
                      <p className="mt-2 text-sm leading-6 text-stone-700">{formData.skills}</p>
                    ) : null}
                    {languagesText ? (
                      <div className="mt-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-stone-400">Languages</p>
                        <p className="mt-1 text-sm text-stone-700">{languagesText}</p>
                      </div>
                    ) : null}
                  </div>
                )}

                {hasCertifications && (
                  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <h2 className="text-sm font-black text-stone-900">Certifications</h2>
                    <div className="mt-3 space-y-3">
                      {formData.certifications.map((cert, index) => (
                        <div key={index}>
                          <p className="text-sm font-bold text-stone-900">{cert.title}</p>
                          <p className="mt-0.5 text-sm text-stone-700">{cert.issuer}</p>
                          <p className="mt-0.5 text-xs text-stone-500">{cert.year}</p>
                          {cert.link ? (
                            <a
                              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                              href={cert.link}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Link <FaExternalLinkAlt className="text-[10px]" />
                            </a>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main */}
            <main className="md:col-span-8">
              <div className="space-y-6">
                {hasEducation && (
                  <section>
                    <SectionTitle>Education</SectionTitle>
                    <div className="space-y-3">
                      {formData.education.map((edu, index) => (
                        <div key={index} className="rounded-2xl border border-stone-200 bg-white p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <h3 className="text-base font-bold text-stone-900">{edu.institution}</h3>
                            <p className="text-sm font-semibold text-stone-500">{edu.year}</p>
                          </div>
                          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-stone-700">{edu.degree}</p>
                            {edu.cgpa ? (
                              <p className="text-sm font-medium text-stone-500">CGPA: {edu.cgpa}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {hasExperience && (
                  <section>
                    <SectionTitle>Experience</SectionTitle>
                    <div className="space-y-4">
                      {formData.experience.map((exp, index) => (
                        <div key={index} className="rounded-2xl border border-stone-200 bg-white p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                            <h3 className="text-base font-bold text-stone-900 sm:text-lg">{exp.company}</h3>
                            <p className="text-sm font-medium text-stone-500">{exp.duration}</p>
                          </div>
                          {exp.role ? (
                            <p className="mt-2 text-sm font-semibold text-stone-700 sm:text-base">{exp.role}</p>
                          ) : null}
                          {exp.responsibilities ? (
                            <div className="mt-3">
                              {Array.isArray(exp.responsibilities) ? (
                                <ul className="list-disc space-y-1 pl-5">
                                  {exp.responsibilities.map((resp, respIndex) => (
                                    <li key={respIndex} className="text-sm leading-6 text-stone-700">
                                      {resp}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm leading-6 text-stone-700">{exp.responsibilities}</p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {hasProjects && (
                  <section>
                    <SectionTitle>Projects</SectionTitle>
                    <div className="space-y-4">
                      {formData.projects.map((project, index) => (
                        <div key={index} className="rounded-2xl border border-stone-200 bg-white p-4">
                          <div className="flex flex-col gap-2">
                            <h3 className="text-base font-bold text-stone-900 sm:text-lg">{project.title}</h3>
                            {project.description ? (
                              <p className="text-sm leading-6 text-stone-700 sm:text-base">{project.description}</p>
                            ) : null}
                            {project.technologies ? (
                              <p className="text-sm italic text-stone-500">
                                <span className="font-semibold not-italic text-stone-700">Technologies:</span>{" "}
                                {project.technologies}
                              </p>
                            ) : null}
                            {project.link ? (
                              <a
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 underline underline-offset-2 transition-colors hover:text-blue-800"
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Project Link <FaExternalLinkAlt className="text-xs" />
                              </a>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  function MinimalLayout() {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white">
          <div className="pb-4">
            <h1 className="text-3xl font-black text-stone-900 sm:text-4xl">{formData.name || "Your Name"}</h1>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-stone-600 sm:text-sm">
              {formData.email ? <a href={`mailto:${formData.email}`}>{formData.email}</a> : null}
              {formData.phone ? <a href={`tel:${formData.phone}`}>{formData.phone}</a> : null}
              {formData.linkedIn ? (
                <a href={formData.linkedIn} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
              ) : null}
              {formData.github ? (
                <a href={formData.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              ) : null}
              {formData.address ? <span className="text-stone-500">{formData.address}</span> : null}
            </div>
          </div>

          <div className="h-px w-full bg-stone-200" />

          <div className="mt-5 space-y-6">
            {hasEducation && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Education</h2>
                <div className="mt-2 space-y-3">
                  {formData.education.map((edu, index) => (
                    <div key={index}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm font-bold text-stone-900">{edu.institution}</p>
                        <p className="text-xs font-semibold text-stone-500">{edu.year}</p>
                      </div>
                      <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-stone-700">{edu.degree}</p>
                        {edu.cgpa ? (
                          <p className="text-xs font-medium text-stone-500">CGPA: {edu.cgpa}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasExperience && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Experience</h2>
                <div className="mt-2 space-y-4">
                  {formData.experience.map((exp, index) => (
                    <div key={index}>
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <p className="text-sm font-bold text-stone-900">{exp.company}</p>
                        <p className="text-xs font-semibold text-stone-500">{exp.duration}</p>
                      </div>
                      {exp.role ? <p className="mt-1 text-sm text-stone-700">{exp.role}</p> : null}
                      {exp.responsibilities ? (
                        <div className="mt-2">
                          {Array.isArray(exp.responsibilities) ? (
                            <ul className="list-disc space-y-1 pl-5">
                              {exp.responsibilities.map((resp, respIndex) => (
                                <li key={respIndex} className="text-sm leading-6 text-stone-700">
                                  {resp}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm leading-6 text-stone-700">{exp.responsibilities}</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {hasProjects && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Projects</h2>
                <div className="mt-2 space-y-4">
                  {formData.projects.map((project, index) => (
                    <div key={index}>
                      <p className="text-sm font-bold text-stone-900">{project.title}</p>
                      {project.description ? (
                        <p className="mt-1 text-sm leading-6 text-stone-700">{project.description}</p>
                      ) : null}
                      {project.technologies ? (
                        <p className="mt-1 text-xs text-stone-500">{project.technologies}</p>
                      ) : null}
                      {project.link ? (
                        <a
                          className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(formData.skills || languagesText) && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Skills</h2>
                <div className="mt-2 space-y-2">
                  {formData.skills ? <p className="text-sm text-stone-700">{formData.skills}</p> : null}
                  {languagesText ? <p className="text-sm text-stone-700">{languagesText}</p> : null}
                </div>
              </section>
            )}

            {hasCertifications && (
              <section>
                <h2 className="text-xs font-black uppercase tracking-widest text-stone-700">Certifications</h2>
                <div className="mt-2 space-y-3">
                  {formData.certifications.map((cert, index) => (
                    <div key={index}>
                      <p className="text-sm font-bold text-stone-900">{cert.title}</p>
                      <p className="mt-0.5 text-sm text-stone-700">{cert.issuer}</p>
                      <p className="mt-0.5 text-xs text-stone-500">{cert.year}</p>
                      {cert.link ? (
                        <a
                          className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
                          href={cert.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Link <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedLayout === "modern") return <ModernLayout />;
  if (selectedLayout === "minimal") return <MinimalLayout />;
  return <ClassicLayout />;
}