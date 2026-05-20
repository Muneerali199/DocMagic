import { saveAs } from 'file-saver';

// Same structure as in resume-preview.tsx
export interface ResumeData {
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
  [key: string]: any;
}

/**
 * Escapes special LaTeX characters in a string.
 */
export function escapeLatex(text: string | null | undefined): string {
  if (!text) return '';
  
  return String(text)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}')
    // Also handle some common unicode/formatting issues that break LaTeX easily
    .replace(/—/g, '---')
    .replace(/–/g, '--')
    .replace(/“/g, "``")
    .replace(/”/g, "''")
    .replace(/‘/g, "`")
    .replace(/’/g, "'");
}

/**
 * Generates a clean, compile-ready LaTeX string from ResumeData.
 */
export function generateLaTeX(resume: ResumeData): string {
  const sections: string[] = [];

  // Preamble
  sections.push(`\\documentclass[11pt,a4paper]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{geometry}
\\geometry{
  a4paper,
  left=0.5in,
  right=0.5in,
  top=0.6in,
  bottom=0.6in
}

\\titleformat{\\section}{\\Large\\bfseries\\vspace{2pt}}{}{0em}{}[\\color{black}\\titlerule\\vspace{4pt}]

\\begin{document}
`);

  // Header / Contact Info
  sections.push(`\\begin{center}`);
  sections.push(`{\\Huge \\textbf{${escapeLatex(resume.name || "Your Name")}}} \\vspace{4pt} \\\\`);
  
  const contactInfo: string[] = [];
  if (resume.email) contactInfo.push(`\\href{mailto:${escapeLatex(resume.email)}}{${escapeLatex(resume.email)}}`);
  if (resume.phone) contactInfo.push(escapeLatex(String(resume.phone)));
  if (resume.location) contactInfo.push(escapeLatex(resume.location));
  if (resume.linkedin) contactInfo.push(`\\href{${escapeLatex(resume.linkedin)}}{LinkedIn}`);
  if (resume.github) contactInfo.push(`\\href{${escapeLatex(resume.github)}}{GitHub}`);
  if (resume.website) contactInfo.push(`\\href{${escapeLatex(resume.website)}}{Website}`);
  if (resume.portfolio) contactInfo.push(`\\href{${escapeLatex(resume.portfolio)}}{Portfolio}`);
  
  if (contactInfo.length > 0) {
    sections.push(contactInfo.join(' $|$ '));
  }
  sections.push(`\\end{center}`);
  sections.push(`\\vspace{-10pt}`);

  // Summary
  if (resume.summary) {
    sections.push(`\\section*{Summary}`);
    sections.push(`${escapeLatex(resume.summary)}`);
  }

  // Work Experience
  if (resume.experience && resume.experience.length > 0) {
    sections.push(`\\section*{Experience}`);
    sections.push(`\\begin{itemize}[leftmargin=0.15in, label={}]`);
    
    resume.experience.forEach(exp => {
      sections.push(`  \\item`);
      sections.push(`    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}`);
      sections.push(`      \\textbf{${escapeLatex(exp.title || '')}} & ${escapeLatex(exp.date || '')} \\\\`);
      sections.push(`      \\textit{${escapeLatex(exp.company || '')}}${exp.location ? ` -- ${escapeLatex(exp.location)}` : ''} & \\\\`);
      sections.push(`    \\end{tabular*}\\vspace{-5pt}`);
      
      if (exp.description && exp.description.length > 0) {
        sections.push(`    \\begin{itemize}[leftmargin=0.15in]`);
        exp.description.forEach(desc => {
          if (desc.trim()) {
            sections.push(`      \\item ${escapeLatex(desc)}`);
          }
        });
        sections.push(`    \\end{itemize}`);
      }
    });
    
    sections.push(`\\end{itemize}`);
  }

  // Education
  if (resume.education && resume.education.length > 0) {
    sections.push(`\\section*{Education}`);
    sections.push(`\\begin{itemize}[leftmargin=0.15in, label={}]`);
    
    resume.education.forEach(edu => {
      sections.push(`  \\item`);
      sections.push(`    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}`);
      sections.push(`      \\textbf{${escapeLatex(edu.institution || '')}} & ${escapeLatex(edu.date || '')} \\\\`);
      sections.push(`      \\textit{${escapeLatex(edu.degree || '')}} & ${edu.gpa ? `GPA: ${escapeLatex(edu.gpa)}` : ''} \\\\`);
      sections.push(`    \\end{tabular*}\\vspace{-5pt}`);
      if (edu.honors) {
        sections.push(`    \\begin{itemize}[leftmargin=0.15in]`);
        sections.push(`      \\item Honors: ${escapeLatex(edu.honors)}`);
        sections.push(`    \\end{itemize}`);
      }
    });
    
    sections.push(`\\end{itemize}`);
  }

  // Skills
  if (resume.skills && (
    (resume.skills.technical && resume.skills.technical.length > 0) ||
    (resume.skills.programming && resume.skills.programming.length > 0) ||
    (resume.skills.tools && resume.skills.tools.length > 0) ||
    (resume.skills.soft && resume.skills.soft.length > 0)
  )) {
    sections.push(`\\section*{Skills}`);
    sections.push(`\\begin{itemize}[leftmargin=0.15in, label={}]`);
    sections.push(`  \\item \\begin{tabular}{@{}l l}`);
    
    const skillLines = [];
    if (resume.skills.programming && resume.skills.programming.length > 0) {
      skillLines.push(`    \\textbf{Programming:} & ${escapeLatex(resume.skills.programming.join(', '))} \\\\`);
    }
    if (resume.skills.technical && resume.skills.technical.length > 0) {
      skillLines.push(`    \\textbf{Technical:} & ${escapeLatex(resume.skills.technical.join(', '))} \\\\`);
    }
    if (resume.skills.tools && resume.skills.tools.length > 0) {
      skillLines.push(`    \\textbf{Tools:} & ${escapeLatex(resume.skills.tools.join(', '))} \\\\`);
    }
    if (resume.skills.soft && resume.skills.soft.length > 0) {
      skillLines.push(`    \\textbf{Soft Skills:} & ${escapeLatex(resume.skills.soft.join(', '))} \\\\`);
    }
    
    sections.push(skillLines.join('\\vspace{2pt}\n'));
    sections.push(`  \\end{tabular}`);
    sections.push(`\\end{itemize}`);
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    sections.push(`\\section*{Projects}`);
    sections.push(`\\begin{itemize}[leftmargin=0.15in, label={}]`);
    
    resume.projects.forEach(proj => {
      sections.push(`  \\item`);
      sections.push(`    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}`);
      
      const projectNameAndLink = proj.link 
        ? `\\textbf{\\href{${escapeLatex(proj.link)}}{${escapeLatex(proj.name || '')}}}`
        : `\\textbf{${escapeLatex(proj.name || '')}}`;
        
      const techStack = proj.technologies && proj.technologies.length > 0 
        ? `$|$ \\emph{${escapeLatex(proj.technologies.join(', '))}}`
        : '';
        
      sections.push(`      ${projectNameAndLink} ${techStack} & \\\\`);
      sections.push(`    \\end{tabular*}\\vspace{-5pt}`);
      
      if (proj.description) {
        sections.push(`    \\begin{itemize}[leftmargin=0.15in]`);
        sections.push(`      \\item ${escapeLatex(proj.description)}`);
        sections.push(`    \\end{itemize}`);
      }
    });
    
    sections.push(`\\end{itemize}`);
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    sections.push(`\\section*{Certifications}`);
    sections.push(`\\begin{itemize}[leftmargin=0.15in, label={}]`);
    
    resume.certifications.forEach(cert => {
      sections.push(`  \\item`);
      sections.push(`    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}`);
      sections.push(`      \\textbf{${escapeLatex(cert.name || '')}} & ${escapeLatex(cert.date || '')} \\\\`);
      sections.push(`      \\textit{${escapeLatex(cert.issuer || '')}} & \\\\`);
      sections.push(`    \\end{tabular*}\\vspace{-5pt}`);
    });
    
    sections.push(`\\end{itemize}`);
  }

  sections.push(`\\end{document}`);

  return sections.join('\n');
}

/**
 * Generates and triggers a download of the LaTeX source file.
 */
export async function exportToLaTeXFile(resume: ResumeData, filename?: string): Promise<void> {
  const latexSource = generateLaTeX(resume);
  const blob = new Blob([latexSource], { type: 'application/x-latex;charset=utf-8' });
  
  let downloadName = filename;
  if (!downloadName) {
    const safeName = resume.name ? resume.name.replace(/\s+/g, '-').toLowerCase() : 'resume';
    downloadName = `${safeName}.tex`;
  }
  
  saveAs(blob, downloadName);
}
