import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { RESUME_TEMPLATES } from '@/lib/resume-template-data';

// Standard styles for the unified PDF layout
const createStyles = (primaryColor: string) => StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor,
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 9,
    color: '#666666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: primaryColor,
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 3,
  },
  itemGroup: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  itemTitle: {
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  itemSubtitle: {
    fontFamily: 'Helvetica-Oblique',
    color: '#555555',
  },
  itemDate: {
    fontSize: 9,
    color: '#666666',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 10,
  },
  bullet: {
    width: 10,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
  },
  skillsGroup: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillsLabel: {
    fontFamily: 'Helvetica-Bold',
    width: 80,
    color: '#333333',
  },
  skillsText: {
    flex: 1,
    color: '#555555',
  },
  summary: {
    marginBottom: 15,
    textAlign: 'justify',
  }
});

interface ResumeData {
  name?: string;
  email?: string;
  phone?: string | number;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  summary?: string;
  experience?: Array<{
    title?: string;
    company?: string;
    location?: string;
    date?: string;
    description?: string[];
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    location?: string;
    date?: string;
    gpa?: string;
    honors?: string;
  }>;
  skills?: {
    technical?: string[];
    programming?: string[];
    tools?: string[];
    soft?: string[];
  };
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    link?: string;
  }>;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    credential?: string;
  }>;
}

const ResumePDFDocument = ({ resume, templateId }: { resume: ResumeData, templateId: string }) => {
  const currentTemplate = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0];
  const primaryColor = currentTemplate.colorScheme?.[0] || '#2563EB';
  const styles = createStyles(primaryColor);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name || 'Your Name'}</Text>
          <View style={styles.contactInfo}>
            {resume.email && <Text>{resume.email}</Text>}
            {resume.phone && <Text>{resume.phone.toString()}</Text>}
            {resume.location && <Text>{resume.location}</Text>}
            {resume.linkedin && <Text>{resume.linkedin}</Text>}
            {resume.github && <Text>{resume.github}</Text>}
            {resume.website && <Text>{resume.website}</Text>}
          </View>
        </View>

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, i) => (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{exp.title}</Text>
                  <Text style={styles.itemDate}>{exp.date}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</Text>
                {exp.description && exp.description.map((desc, j) => (
                  <View key={j} style={styles.bulletPoint}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText}>{desc}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, i) => (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{edu.institution}</Text>
                  <Text style={styles.itemDate}>{edu.date}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{edu.degree}{edu.location ? ` | ${edu.location}` : ''}</Text>
                {(edu.gpa || edu.honors) && (
                  <Text style={{ fontSize: 9, color: '#555' }}>
                    {edu.gpa ? `GPA: ${edu.gpa}` : ''} {edu.honors ? `| Honors: ${edu.honors}` : ''}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills && (Object.values(resume.skills).some(s => s && s.length > 0)) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Technical:</Text>
                <Text style={styles.skillsText}>{resume.skills.technical.join(', ')}</Text>
              </View>
            )}
            {resume.skills.programming && resume.skills.programming.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Languages:</Text>
                <Text style={styles.skillsText}>{resume.skills.programming.join(', ')}</Text>
              </View>
            )}
            {resume.skills.tools && resume.skills.tools.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Tools:</Text>
                <Text style={styles.skillsText}>{resume.skills.tools.join(', ')}</Text>
              </View>
            )}
            {resume.skills.soft && resume.skills.soft.length > 0 && (
              <View style={styles.skillsGroup}>
                <Text style={styles.skillsLabel}>Soft Skills:</Text>
                <Text style={styles.skillsText}>{resume.skills.soft.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((proj, i) => (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{proj.name}</Text>
                  {proj.link && <Text style={{ fontSize: 9, color: primaryColor }}>{proj.link}</Text>}
                </View>
                <Text style={styles.summary}>{proj.description}</Text>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Tech: {proj.technologies.join(', ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, i) => (
              <View key={i} style={styles.itemGroup}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  <Text style={styles.itemDate}>{cert.date}</Text>
                </View>
                <Text style={styles.itemSubtitle}>{cert.issuer} {cert.credential ? `| ID: ${cert.credential}` : ''}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};

export const generateReactPDF = async (resumeData: ResumeData, templateId: string, isCV: boolean = false): Promise<void> => {
  try {
    const blob = await pdf(<ResumePDFDocument resume={resumeData} templateId={templateId} />).toBlob();
    
    const fileName = isCV 
      ? `${resumeData.name?.replace(/\s+/g, '-').toLowerCase() || 'cv'}-cv.pdf`
      : `${resumeData.name?.replace(/\s+/g, '-').toLowerCase() || 'resume'}.pdf`;
    
    saveAs(blob, fileName);
  } catch (error) {
    console.error("Error generating React PDF:", error);
    throw error;
  }
};
