export function calculateATSScore(resume: any): any {
  let score = 0;
  const feedback: string[] = [];
  const improvements: string[] = [];

  // Check contact info (20 points)
  const contact = resume.personalInfo || {};
  if (contact.name && contact.name !== "Your Name") {
    score += 5;
  } else {
    improvements.push("Add your full name");
  }

  if (contact.email && contact.email.includes("@")) {
    score += 5;
  } else {
    improvements.push("Add a professional email");
  }

  if (contact.phone) {
    score += 5;
  } else {
    improvements.push("Add phone number");
  }

  if (contact.location) {
    score += 5;
  } else {
    improvements.push("Add your location");
  }

  // Check professional summary (15 points)
  if (resume.professionalSummary && resume.professionalSummary.length > 100) {
    score += 15;
    feedback.push("✅ Strong professional summary");
  } else {
    score += 5;
    improvements.push("Expand professional summary to 3-4 sentences");
  }

  // Check experience (30 points)
  const exp = resume.experience || [];
  if (exp.length >= 2) {
    score += 10;
    feedback.push("✅ Multiple work experiences listed");
  } else if (exp.length === 1) {
    score += 5;
    improvements.push("Add more work experience");
  } else {
    improvements.push("Add work experience section");
  }

  // Check for quantifiable achievements
  const hasMetrics = exp.some((e: any) =>
    e.achievements?.some((a: string) => /\d+%|\$\d+|\d+\+/.test(a)),
  );
  if (hasMetrics) {
    score += 10;
    feedback.push("✅ Includes quantifiable achievements");
  } else {
    improvements.push(
      "Add numbers/metrics to achievements (e.g., 'increased sales by 25%')",
    );
  }

  // Check achievement count
  const totalAchievements = exp.reduce(
    (sum: number, e: any) => sum + (e.achievements?.length || 0),
    0,
  );
  if (totalAchievements >= 6) {
    score += 10;
    feedback.push("✅ Detailed work achievements");
  } else {
    improvements.push("Add 3-5 achievements per role");
  }

  // Check education (15 points)
  const edu = resume.education || [];
  if (edu.length > 0) {
    score += 10;
    feedback.push("✅ Education included");
    if (edu[0].gpa) {
      score += 5;
      feedback.push("✅ GPA mentioned");
    }
  } else {
    improvements.push("Add education section");
  }

  // Check skills (15 points)
  const skills = resume.skills || {};
  const totalSkills =
    (skills.technical?.length || 0) +
    (skills.soft?.length || 0) +
    (skills.tools?.length || 0);

  if (totalSkills >= 10) {
    score += 15;
    feedback.push("✅ Comprehensive skills list");
  } else if (totalSkills >= 5) {
    score += 10;
    improvements.push("Add more relevant skills (aim for 10-15)");
  } else {
    score += 5;
    improvements.push("Add technical and soft skills");
  }

  // Check certifications (5 points)
  if (resume.certifications && resume.certifications.length > 0) {
    score += 5;
    feedback.push("✅ Certifications included");
  } else {
    improvements.push("Add relevant certifications if available");
  }

  // Determine grade
  let grade = "F";
  let color = "red";
  if (score >= 90) {
    grade = "A";
    color = "green";
    feedback.push("🎉 Excellent! Your resume is ATS-optimized");
  } else if (score >= 80) {
    grade = "B";
    color = "blue";
    feedback.push("👍 Good! A few tweaks will make it perfect");
  } else if (score >= 70) {
    grade = "C";
    color = "yellow";
    feedback.push("⚠️ Decent, but needs improvement");
  } else if (score >= 60) {
    grade = "D";
    color = "orange";
    feedback.push("⚠️ Needs significant improvement");
  } else {
    color = "red";
    feedback.push("❌ Needs major improvements for ATS compatibility");
  }

  return {
    score,
    grade,
    color,
    feedback,
    improvements,
    breakdown: {
      contactInfo: Math.min(20, contact.name && contact.email ? 20 : 10),
      summary: resume.professionalSummary ? 15 : 5,
      experience: Math.min(30, totalAchievements >= 6 ? 30 : 15),
      education: edu.length > 0 ? 15 : 0,
      skills: Math.min(15, totalSkills >= 10 ? 15 : 8),
      certifications: resume.certifications?.length > 0 ? 5 : 0,
    },
  };
}
