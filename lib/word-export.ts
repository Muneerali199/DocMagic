export interface WordDocumentData {
  title?: string;
  content: string;
  sections?: Array<{
    title?: string;
    content: string;
    type?: 'paragraph' | 'list' | 'table';
  }>;
}

export async function generateWordDocument(data: WordDocumentData, type: 'resume' | 'letter' = 'resume'): Promise<Blob> {
  try {
    // Dynamically import the docx library only when needed
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx');
    
    // Add null check for data
    if (!data) {
      throw new Error('No document data provided');
    }
    
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: generateDocumentContent(data, type, { Paragraph, TextRun, HeadingLevel, AlignmentType }),
      }],
    });

    return await Packer.toBlob(doc);
  } catch (error) {
    console.error('Error generating Word document:', error);
    throw new Error(`Failed to generate Word document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function generateDocumentContent(
  data: WordDocumentData, 
  type: 'resume' | 'letter',
  docxClasses: any
): any[] {
  const { Paragraph, TextRun, HeadingLevel, AlignmentType } = docxClasses;
  const children: any[] = [];

  // Add title
  if (data.title) {
    children.push(
      new Paragraph({
        text: data.title,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      })
    );
  }

  if (type === 'letter') {
    // For letters, format the content as paragraphs
    const paragraphs = data.content.split('\n\n').filter(p => p.trim());
    paragraphs.forEach(paragraph => {
      if (paragraph.trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph.trim(),
                size: 24, // 12pt
              }),
            ],
            spacing: {
              after: 200,
            },
          })
        );
      }
    });
  } else {
    // For resumes, parse the content more intelligently
    if (data.sections) {
      data.sections.forEach(section => {
        if (section.title) {
          children.push(
            new Paragraph({
              text: section.title,
              heading: HeadingLevel.HEADING_2,
              spacing: {
                before: 400,
                after: 200,
              },
            })
          );
        }

        if (section.content) {
          if (section.type === 'list') {
            const items = section.content.split('\n').filter(item => item.trim());
            items.forEach(item => {
              if (item.trim()) {
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '• ',
                        size: 24,
                      }),
                      new TextRun({
                        text: item.trim(),
                        size: 24,
                      }),
                    ],
                    spacing: {
                      after: 100,
                    },
                  })
                );
              }
            });
          } else {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: section.content,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              })
            );
          }
        }
      });
    } else {
      // Fallback to simple paragraph formatting
      const paragraphs = data.content.split('\n\n').filter(p => p.trim());
      paragraphs.forEach(paragraph => {
        if (paragraph.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph.trim(),
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          );
        }
      });
    }
  }

  return children;
}

export function formatResumeForWord(resume: any): WordDocumentData {
  // Add null check for resume
  if (!resume) {
    return {
      title: 'Resume',
      content: 'No resume data available',
      sections: [],
    };
  }

  const sections: any[] = [];

  // Personal Information
  if (resume.name || resume.email || resume.phone || resume.location) {
    sections.push({
      title: 'Personal Information',
      content: [
        resume.name && `Name: ${resume.name}`,
        resume.email && `Email: ${resume.email}`,
        resume.phone && `Phone: ${resume.phone}`,
        resume.location && `Location: ${resume.location}`,
        resume.linkedin && `LinkedIn: ${resume.linkedin}`,
        resume.github && `GitHub: ${resume.github}`,
        resume.website && `Website: ${resume.website}`,
      ].filter(Boolean).join('\n'),
    });
  }

  // Summary
  if (resume.summary) {
    sections.push({
      title: 'Professional Summary',
      content: resume.summary,
    });
  }

  // Experience
  if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
    sections.push({
      title: 'Work Experience',
      content: resume.experience.map((exp: any) => {
        if (!exp) return '';
        const lines = [
          exp.title && exp.company ? `${exp.title} at ${exp.company}` : '',
          exp.location && `Location: ${exp.location}`,
          exp.date && `Duration: ${exp.date}`,
          '',
          ...(Array.isArray(exp.description) ? exp.description : []),
        ];
        return lines.filter(Boolean).join('\n');
      }).filter(Boolean).join('\n\n'),
    });
  }

  // Education
  if (resume.education && Array.isArray(resume.education) && resume.education.length > 0) {
    sections.push({
      title: 'Education',
      content: resume.education.map((edu: any) => {
        if (!edu) return '';
        const lines = [
          edu.degree && edu.institution ? `${edu.degree} from ${edu.institution}` : '',
          edu.location && `Location: ${edu.location}`,
          edu.date && `Graduated: ${edu.date}`,
          edu.gpa && `GPA: ${edu.gpa}`,
          edu.honors && `Honors: ${edu.honors}`,
        ];
        return lines.filter(Boolean).join('\n');
      }).filter(Boolean).join('\n\n'),
    });
  }

  // Skills
  if (resume.skills && typeof resume.skills === 'object') {
    const skillSections = [];
    if (resume.skills.technical && Array.isArray(resume.skills.technical) && resume.skills.technical.length > 0) {
      skillSections.push(`Technical Skills: ${resume.skills.technical.join(', ')}`);
    }
    if (resume.skills.programming && Array.isArray(resume.skills.programming) && resume.skills.programming.length > 0) {
      skillSections.push(`Programming Languages: ${resume.skills.programming.join(', ')}`);
    }
    if (resume.skills.tools && Array.isArray(resume.skills.tools) && resume.skills.tools.length > 0) {
      skillSections.push(`Tools & Technologies: ${resume.skills.tools.join(', ')}`);
    }
    if (resume.skills.soft && Array.isArray(resume.skills.soft) && resume.skills.soft.length > 0) {
      skillSections.push(`Soft Skills: ${resume.skills.soft.join(', ')}`);
    }
    if (skillSections.length > 0) {
      sections.push({
        title: 'Skills',
        content: skillSections.join('\n'),
      });
    }
  }

  // Projects
  if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
    sections.push({
      title: 'Projects',
      content: resume.projects.map((project: any) => {
        if (!project) return '';
        const lines = [
          project.name || '',
          project.description || '',
          project.technologies && Array.isArray(project.technologies) ? `Technologies: ${project.technologies.join(', ')}` : '',
          project.link && `Link: ${project.link}`,
        ];
        return lines.filter(Boolean).join('\n');
      }).filter(Boolean).join('\n\n'),
    });
  }

  // Certifications
  if (resume.certifications && Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    sections.push({
      title: 'Certifications',
      content: resume.certifications.map((cert: any) => {
        if (!cert) return '';
        const lines = [
          cert.name && cert.issuer ? `${cert.name} from ${cert.issuer}` : '',
          cert.date && `Date: ${cert.date}`,
          cert.credential && `Credential ID: ${cert.credential}`,
        ];
        return lines.filter(Boolean).join('\n');
      }).filter(Boolean).join('\n\n'),
    });
  }

  return {
    title: `${resume.name || 'Resume'}`,
    content: '',
    sections,
  };
}

export function formatLetterForWord(letter: any): WordDocumentData {
  // Add null check for letter
  if (!letter) {
    return {
      title: 'Letter',
      content: 'No letter data available',
    };
  }

  const content = [
    letter.from?.name && letter.from?.address ? `${letter.from.name}\n${letter.from.address}` : letter.from?.name || '',
    '',
    letter.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    '',
    letter.to?.name && letter.to?.address ? `${letter.to.name}\n${letter.to.address}` : letter.to?.name || '',
    '',
    letter.subject && `Subject: ${letter.subject}`,
    '',
    letter.content || '',
  ].filter(Boolean).join('\n');

  return {
    title: letter.subject || 'Letter',
    content,
  };
} 