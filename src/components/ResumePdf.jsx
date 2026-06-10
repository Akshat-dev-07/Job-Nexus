import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

const classicStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },

  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    fontSize: 9.5,
    color: "#374151",
  },
  contactItem: {
    marginHorizontal: 4,
  },
  address: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },

  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginTop: 4,
    marginBottom: 12,
  },

  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },

  entry: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  meta: {
    fontSize: 9.5,
    color: "#4b5563",
  },
  description: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.4,
  },
  technologies: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#6b7280",
    marginTop: 3,
  },
  link: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "underline",
    marginTop: 3,
  },

  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
    marginLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.8,
    lineHeight: 1.4,
  },
});

const modernStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9.5,
    color: "#374151",
    marginTop: 6,
  },
  contactItem: {
    marginRight: 10,
    marginBottom: 2,
  },
  address: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    marginTop: 8,
    marginBottom: 12,
  },
  bodyRow: {
    flexDirection: "row",
    gap: 18,
  },
  sidebar: {
    width: "32%",
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
  },
  main: {
    flex: 1,
    paddingLeft: 2,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  entry: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  meta: {
    fontSize: 9.5,
    color: "#4b5563",
  },
  description: {
    fontSize: 10,
    marginTop: 4,
    lineHeight: 1.4,
  },
  technologies: {
    fontSize: 9,
    fontStyle: "italic",
    color: "#6b7280",
    marginTop: 3,
  },
  link: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "underline",
    marginTop: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
    marginLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.8,
    lineHeight: 1.4,
  },
});

const minimalStyles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 32,
    paddingHorizontal: 36,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    fontSize: 9.5,
    color: "#374151",
    marginTop: 6,
  },
  contactItem: {
    marginRight: 10,
    marginBottom: 2,
  },
  address: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 3,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    color: "#374151",
  },
  entry: {
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  titleBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  meta: {
    fontSize: 9.5,
    color: "#4b5563",
  },
  description: {
    fontSize: 10,
    marginTop: 3,
    lineHeight: 1.4,
  },
  technologies: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  link: {
    fontSize: 9,
    color: "#2563eb",
    textDecoration: "underline",
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginTop: 3,
    marginLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9.8,
    lineHeight: 1.4,
  },
});

export const ResumePDF = ({ formData }) => {
  const selectedLayout =
    typeof formData?.layout === "string" && formData.layout.trim()
      ? formData.layout.trim().toLowerCase()
      : "classic";

  const experienceList = Array.isArray(formData.experience) ? formData.experience : [];
  const educationList = Array.isArray(formData.education) ? formData.education : [];
  const projectList = Array.isArray(formData.projects) ? formData.projects : [];
  const certificationList = Array.isArray(formData.certifications)
    ? formData.certifications
    : [];

  const languagesText =
    typeof formData.languages === "string"
      ? formData.languages
      : Array.isArray(formData.languages)
      ? formData.languages.join(", ")
      : "";

  function ContactRow({ styles }) {
    return (
      <View style={styles.contactRow}>
        {formData.email ? <Text style={styles.contactItem}>{formData.email}</Text> : null}
        {formData.phone ? <Text style={styles.contactItem}>{formData.phone}</Text> : null}
        {formData.linkedIn ? (
          <Link src={formData.linkedIn} style={styles.contactItem}>
            LinkedIn
          </Link>
        ) : null}
        {formData.github ? (
          <Link src={formData.github} style={styles.contactItem}>
            GitHub
          </Link>
        ) : null}
      </View>
    );
  }

  function EducationSection({ styles, showDivider }) {
    if (educationList.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {showDivider ? <View style={styles.divider} /> : null}
        {educationList.map((edu, i) => (
          <View key={i} style={styles.entry}>
            <View style={styles.rowBetween}>
              <Text style={styles.titleBold}>{edu.institution || ""}</Text>
              <Text style={styles.meta}>{edu.year || ""}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.text}>{edu.degree || ""}</Text>
              {edu.cgpa ? <Text style={styles.meta}>CGPA: {edu.cgpa}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    );
  }

  function ProjectsSection({ styles, showDivider }) {
    if (projectList.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        {showDivider ? <View style={styles.divider} /> : null}
        {projectList.map((project, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.titleBold}>{project.title || ""}</Text>
            {project.description ? <Text style={styles.description}>{project.description}</Text> : null}
            {project.technologies ? (
              <Text style={styles.technologies}>Technologies: {project.technologies}</Text>
            ) : null}
            {project.link ? (
              <Link src={project.link} style={styles.link}>
                Project Link
              </Link>
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  function ExperienceSection({ styles, showDivider }) {
    if (experienceList.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        {showDivider ? <View style={styles.divider} /> : null}
        {experienceList.map((exp, i) => (
          <View key={i} style={styles.entry}>
            <View style={styles.rowBetween}>
              <Text style={styles.titleBold}>{exp.company || ""}</Text>
              <Text style={styles.meta}>{exp.duration || ""}</Text>
            </View>
            {exp.role ? <Text style={styles.text}>{exp.role}</Text> : null}
            {Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0
              ? exp.responsibilities.map((resp, idx) => (
                  <View key={idx} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{resp}</Text>
                  </View>
                ))
              : exp.responsibilities
              ? (
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{exp.responsibilities}</Text>
                </View>
              )
              : null}
          </View>
        ))}
      </View>
    );
  }

  function SkillsSection({ styles, showDivider }) {
    if (!formData.skills && !languagesText) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {showDivider ? <View style={styles.divider} /> : null}
        {formData.skills ? (
          <Text style={styles.text}>
            <Text style={styles.titleBold}>Technical Skills: </Text>
            {formData.skills}
          </Text>
        ) : null}
        {languagesText ? (
          <Text style={[styles.text, { marginTop: 4 }]}>
            <Text style={styles.titleBold}>Languages: </Text>
            {languagesText}
          </Text>
        ) : null}
      </View>
    );
  }

  function CertificationsSection({ styles, showDivider }) {
    if (certificationList.length === 0) return null;
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        {showDivider ? <View style={styles.divider} /> : null}
        {certificationList.map((cert, i) => (
          <View key={i} style={styles.entry}>
            <Text style={styles.titleBold}>{cert.title || ""}</Text>
            <Text style={styles.text}>
              {cert.issuer || ""}
              {cert.year ? ` (${cert.year})` : ""}
            </Text>
            {cert.link ? (
              <Link src={cert.link} style={styles.link}>
                Certification Link
              </Link>
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  function ClassicPage() {
    const styles = classicStyles;
    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{formData.name || "Your Name"}</Text>
          <View style={styles.contactRow}>
            {formData.email ? <Text style={styles.contactItem}>{formData.email}</Text> : null}
            {formData.email && formData.phone ? <Text>|</Text> : null}
            {formData.phone ? <Text style={styles.contactItem}>{formData.phone}</Text> : null}
            {(formData.email || formData.phone) && formData.linkedIn ? <Text>|</Text> : null}
            {formData.linkedIn ? (
              <Link src={formData.linkedIn} style={styles.contactItem}>
                LinkedIn
              </Link>
            ) : null}
            {(formData.email || formData.phone || formData.linkedIn) && formData.github ? (
              <Text>|</Text>
            ) : null}
            {formData.github ? (
              <Link src={formData.github} style={styles.contactItem}>
                GitHub
              </Link>
            ) : null}
          </View>
          {formData.address ? <Text style={styles.address}>{formData.address}</Text> : null}
        </View>

        <View style={styles.divider} />

        <EducationSection styles={styles} showDivider />
        <ProjectsSection styles={styles} showDivider />
        <ExperienceSection styles={styles} showDivider />
        <SkillsSection styles={styles} showDivider />
        <CertificationsSection styles={styles} showDivider />
      </Page>
    );
  }

  function ModernPage() {
    const styles = modernStyles;
    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{formData.name || "Your Name"}</Text>
          <ContactRow styles={styles} />
          {formData.address ? <Text style={styles.address}>{formData.address}</Text> : null}
        </View>

        <View style={styles.divider} />

        <View style={styles.bodyRow}>
          <View style={styles.sidebar}>
            <SkillsSection styles={styles} showDivider={false} />
            <CertificationsSection styles={styles} showDivider={false} />
          </View>

          <View style={styles.main}>
            <EducationSection styles={styles} showDivider={false} />
            <ExperienceSection styles={styles} showDivider={false} />
            <ProjectsSection styles={styles} showDivider={false} />
          </View>
        </View>
      </Page>
    );
  }

  function MinimalPage() {
    const styles = minimalStyles;
    const showDivider = false;
    return (
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{formData.name || "Your Name"}</Text>
          <ContactRow styles={styles} />
          {formData.address ? <Text style={styles.address}>{formData.address}</Text> : null}
        </View>

        <EducationSection styles={styles} showDivider={showDivider} />
        <ExperienceSection styles={styles} showDivider={showDivider} />
        <ProjectsSection styles={styles} showDivider={showDivider} />
        <SkillsSection styles={styles} showDivider={showDivider} />
        <CertificationsSection styles={styles} showDivider={showDivider} />
      </Page>
    );
  }

  return (
    <Document>
      {selectedLayout === "modern" ? (
        <ModernPage />
      ) : selectedLayout === "minimal" ? (
        <MinimalPage />
      ) : (
        <ClassicPage />
      )}
    </Document>
  );
};