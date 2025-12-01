'use client';

// Complete sample data for professional resumes
const professionalData = {
  name: 'JOHN ANDERSON',
  title: 'Senior Software Engineer',
  email: 'john.anderson@email.com',
  phone: '(555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/johnanderson',
  github: 'github.com/johnanderson',
  summary: 'Results-driven Senior Software Engineer with 6+ years of experience building scalable web applications and microservices. Proven track record of leading cross-functional teams and delivering high-impact solutions that improve system performance by 40% and reduce costs by $500K annually. Expert in React, Node.js, and AWS with strong focus on code quality and best practices.',
  experience: [
    {
      title: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'San Francisco, CA',
      date: 'Jan 2021 - Present',
      achievements: [
        'Led development of microservices architecture serving 2M+ daily active users, improving system reliability from 95% to 99.9%',
        'Reduced API response time by 60% through implementation of Redis caching and database query optimization',
        'Mentored team of 5 junior developers, resulting in 40% faster onboarding and 25% increase in code quality metrics',
        'Implemented CI/CD pipeline using Jenkins and Docker, reducing deployment time from 2 hours to 15 minutes',
        'Architected and deployed serverless functions on AWS Lambda, cutting infrastructure costs by $500K annually'
      ]
    },
    {
      title: 'Software Engineer',
      company: 'Digital Innovations LLC',
      location: 'San Francisco, CA',
      date: 'Jun 2018 - Dec 2020',
      achievements: [
        'Developed RESTful APIs using Node.js and Express, handling 500K+ requests per day with 99.5% uptime',
        'Built responsive web applications using React and Redux, improving user engagement by 35%',
        'Collaborated with product team to define technical requirements for 10+ features, ensuring on-time delivery',
        'Reduced bug count by 45% through implementation of comprehensive unit and integration testing with Jest',
        'Optimized database queries and indexes, improving page load times by 50%'
      ]
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      date: 'Sep 2014 - May 2018',
      gpa: '3.8/4.0',
      honors: 'Magna Cum Laude, Dean\'s List (6 semesters)'
    }
  ],
  skills: {
    languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'HTML/CSS'],
    frameworks: ['React', 'Node.js', 'Express', 'Next.js', 'Redux', 'GraphQL'],
    tools: ['AWS', 'Docker', 'Kubernetes', 'Git', 'Jenkins', 'MongoDB', 'PostgreSQL'],
    practices: ['Agile/Scrum', 'CI/CD', 'TDD', 'Microservices', 'RESTful APIs']
  },
  projects: [
    {
      name: 'E-Commerce Platform',
      description: 'Built full-stack e-commerce platform with payment processing, inventory management, and real-time analytics',
      tech: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS'],
      impact: 'Serving 100K+ users with $2M+ in monthly transactions'
    },
    {
      name: 'Real-Time Chat Application',
      description: 'Developed scalable chat application with WebSocket support, message encryption, and file sharing',
      tech: ['React', 'Socket.io', 'Redis', 'PostgreSQL'],
      impact: 'Supporting 50K+ concurrent users'
    }
  ],
  certifications: [
    'AWS Certified Solutions Architect - Associate (2023)',
    'Professional Scrum Master I (PSM I) - Scrum.org (2022)'
  ]
};

// ATS-Optimized Professional Template
export function ATSProfessionalTemplate() {
  return (
    <div className="w-full h-full bg-white p-12 overflow-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 tracking-wide">{professionalData.name}</h1>
        <div className="text-sm text-gray-700 space-y-1">
          <div>{professionalData.email} | {professionalData.phone} | {professionalData.location}</div>
          <div>{professionalData.linkedin} | {professionalData.github}</div>
        </div>
      </div>

      {/* Professional Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-2 uppercase border-b-2 border-black pb-1">Professional Summary</h2>
        <p className="text-sm leading-relaxed text-gray-800">{professionalData.summary}</p>
      </div>

      {/* Professional Experience */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 uppercase border-b-2 border-black pb-1">Professional Experience</h2>
        {professionalData.experience.map((job, i) => (
          <div key={i} className="mb-4">
            <div className="flex justify-between items-baseline mb-1">
              <div>
                <h3 className="text-base font-bold">{job.title}</h3>
                <div className="text-sm text-gray-700">{job.company}, {job.location}</div>
              </div>
              <div className="text-sm text-gray-600 font-semibold">{job.date}</div>
            </div>
            <ul className="list-disc ml-6 mt-2 space-y-1.5">
              {job.achievements.map((achievement, j) => (
                <li key={j} className="text-sm leading-relaxed text-gray-800">{achievement}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Education */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 uppercase border-b-2 border-black pb-1">Education</h2>
        {professionalData.education.map((edu, i) => (
          <div key={i} className="mb-2">
            <div className="flex justify-between items-baseline">
              <div>
                <h3 className="text-base font-bold">{edu.degree}</h3>
                <div className="text-sm text-gray-700">{edu.school}, {edu.location}</div>
                <div className="text-sm text-gray-600">GPA: {edu.gpa} | {edu.honors}</div>
              </div>
              <div className="text-sm text-gray-600 font-semibold">{edu.date}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Technical Skills */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 uppercase border-b-2 border-black pb-1">Technical Skills</h2>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-bold">Languages:</span> {professionalData.skills.languages.join(', ')}
          </div>
          <div className="text-sm">
            <span className="font-bold">Frameworks & Libraries:</span> {professionalData.skills.frameworks.join(', ')}
          </div>
          <div className="text-sm">
            <span className="font-bold">Tools & Technologies:</span> {professionalData.skills.tools.join(', ')}
          </div>
          <div className="text-sm">
            <span className="font-bold">Practices:</span> {professionalData.skills.practices.join(', ')}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="mb-6">
        <h2 className="text-lg font-bold mb-3 uppercase border-b-2 border-black pb-1">Key Projects</h2>
        {professionalData.projects.map((project, i) => (
          <div key={i} className="mb-3">
            <h3 className="text-base font-bold">{project.name}</h3>
            <p className="text-sm text-gray-800 leading-relaxed mt-1">{project.description}</p>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Technologies:</span> {project.tech.join(', ')}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Impact:</span> {project.impact}
            </div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div>
        <h2 className="text-lg font-bold mb-3 uppercase border-b-2 border-black pb-1">Certifications</h2>
        <ul className="list-disc ml-6 space-y-1">
          {professionalData.certifications.map((cert, i) => (
            <li key={i} className="text-sm text-gray-800">{cert}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Modern Tech Resume (Google/Facebook style)
export function ModernTechTemplate() {
  return (
    <div className="w-full h-full bg-white overflow-auto">
      {/* Blue Header Bar */}
      <div className="bg-blue-600 text-white p-8">
        <h1 className="text-3xl font-bold mb-2">{professionalData.name}</h1>
        <div className="text-base">{professionalData.title}</div>
        <div className="text-sm mt-2 space-x-3">
          <span>{professionalData.email}</span>
          <span>•</span>
          <span>{professionalData.phone}</span>
          <span>•</span>
          <span>{professionalData.location}</span>
        </div>
        <div className="text-sm mt-1 space-x-3">
          <span>{professionalData.linkedin}</span>
          <span>•</span>
          <span>{professionalData.github}</span>
        </div>
      </div>

      <div className="p-8">
        {/* Technical Skills - First for Tech Roles */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-700 border-b-2 border-blue-700 pb-1">TECHNICAL SKILLS</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="font-bold text-sm mb-1">Languages</div>
              <div className="text-sm text-gray-700">{professionalData.skills.languages.join(', ')}</div>
            </div>
            <div>
              <div className="font-bold text-sm mb-1">Frameworks</div>
              <div className="text-sm text-gray-700">{professionalData.skills.frameworks.join(', ')}</div>
            </div>
            <div>
              <div className="font-bold text-sm mb-1">Tools & Cloud</div>
              <div className="text-sm text-gray-700">{professionalData.skills.tools.join(', ')}</div>
            </div>
            <div>
              <div className="font-bold text-sm mb-1">Methodologies</div>
              <div className="text-sm text-gray-700">{professionalData.skills.practices.join(', ')}</div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-700 border-b-2 border-blue-700 pb-1">EXPERIENCE</h2>
          {professionalData.experience.map((job, i) => (
            <div key={i} className="mb-4 border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-baseline mb-1">
                <div>
                  <h3 className="text-base font-bold text-gray-900">{job.title}</h3>
                  <div className="text-sm font-semibold text-gray-700">{job.company}</div>
                </div>
                <div className="text-sm text-gray-600">{job.date}</div>
              </div>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                {job.achievements.map((achievement, j) => (
                  <li key={j} className="text-sm leading-relaxed text-gray-800">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-700 border-b-2 border-blue-700 pb-1">PROJECTS</h2>
          {professionalData.projects.map((project, i) => (
            <div key={i} className="mb-3 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-base font-bold text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-800 mt-1 leading-relaxed">{project.description}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {project.tech.map((tech, j) => (
                  <span key={j} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded font-medium">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-2 font-semibold">{project.impact}</div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-700 border-b-2 border-blue-700 pb-1">EDUCATION</h2>
          {professionalData.education.map((edu, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <div>
                  <h3 className="text-base font-bold">{edu.degree}</h3>
                  <div className="text-sm text-gray-700">{edu.school}</div>
                  <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>
                </div>
                <div className="text-sm text-gray-600">{edu.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div>
          <h2 className="text-xl font-bold mb-3 text-blue-700 border-b-2 border-blue-700 pb-1">CERTIFICATIONS</h2>
          <ul className="space-y-1">
            {professionalData.certifications.map((cert, i) => (
              <li key={i} className="text-sm text-gray-800">• {cert}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Clean Minimal Template (Apple/Airbnb style)
export function CleanMinimalTemplate() {
  return (
    <div className="w-full h-full bg-white p-12 overflow-auto" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-light mb-3 tracking-wide">{professionalData.name}</h1>
        <div className="text-sm text-gray-600 space-x-2">
          <span>{professionalData.email}</span>
          <span>|</span>
          <span>{professionalData.phone}</span>
          <span>|</span>
          <span>{professionalData.location}</span>
        </div>
        <div className="text-sm text-gray-600 mt-1 space-x-2">
          <span>{professionalData.linkedin}</span>
          <span>|</span>
          <span>{professionalData.github}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-8">
        <p className="text-sm leading-relaxed text-gray-800 text-center max-w-4xl mx-auto">
          {professionalData.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xl font-light mb-4 text-center tracking-wider">EXPERIENCE</h2>
        {professionalData.experience.map((job, i) => (
          <div key={i} className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <h3 className="text-base font-semibold">{job.title}</h3>
                <div className="text-sm text-gray-600">{job.company}</div>
              </div>
              <div className="text-sm text-gray-500">{job.date}</div>
            </div>
            <ul className="space-y-1.5">
              {job.achievements.map((achievement, j) => (
                <li key={j} className="text-sm leading-relaxed text-gray-700 pl-4 border-l-2 border-gray-200">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-xl font-light mb-4 text-center tracking-wider">SKILLS</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-semibold text-sm mb-1">Languages</div>
            <div className="text-sm text-gray-700">{professionalData.skills.languages.join(' • ')}</div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Frameworks</div>
            <div className="text-sm text-gray-700">{professionalData.skills.frameworks.join(' • ')}</div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Tools</div>
            <div className="text-sm text-gray-700">{professionalData.skills.tools.join(' • ')}</div>
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">Practices</div>
            <div className="text-sm text-gray-700">{professionalData.skills.practices.join(' • ')}</div>
          </div>
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-xl font-light mb-4 text-center tracking-wider">EDUCATION</h2>
        {professionalData.education.map((edu, i) => (
          <div key={i} className="text-center">
            <h3 className="text-base font-semibold">{edu.degree}</h3>
            <div className="text-sm text-gray-600">{edu.school} | {edu.date}</div>
            <div className="text-sm text-gray-500">GPA: {edu.gpa}</div>
          </div>
        ))}
      </div>

      {/* Projects */}
      <div className="mb-8">
        <h2 className="text-xl font-light mb-4 text-center tracking-wider">PROJECTS</h2>
        {professionalData.projects.map((project, i) => (
          <div key={i} className="mb-4">
            <h3 className="text-base font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-700 mt-1">{project.description}</p>
            <div className="text-sm text-gray-500 mt-1">{project.tech.join(' • ')}</div>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div>
        <h2 className="text-xl font-light mb-4 text-center tracking-wider">CERTIFICATIONS</h2>
        <div className="text-center space-y-1">
          {professionalData.certifications.map((cert, i) => (
            <div key={i} className="text-sm text-gray-700">{cert}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
