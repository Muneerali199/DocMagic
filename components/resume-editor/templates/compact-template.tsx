export function CompactTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Calibri, Arial, sans-serif', lineHeight: '1.4' }}>
      {/* Compact Header */}
      <div style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #000000' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
          {data.name}
        </h1>
        <div style={{ fontSize: '9px', color: '#000000' }}>
          {data.email} | {data.phone} | {data.location}
          {data.linkedin && ` | ${data.linkedin}`}
          {data.github && ` | ${data.github}`}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' }}>
            Summary
          </h2>
          <p style={{ fontSize: '9px', color: '#000000', lineHeight: '1.5' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' }}>
            Skills
          </h2>
          <div style={{ fontSize: '9px', color: '#000000' }}>
            {data.skills.programming && data.skills.programming.length > 0 && (
              <div style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 'bold' }}>Languages: </span>
                {data.skills.programming.join(', ')}
              </div>
            )}
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 'bold' }}>Technologies: </span>
                {data.skills.technical.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '6px', textTransform: 'uppercase' }}>
            Experience
          </h2>
          {data.experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#000000' }}>
                {exp.title} | {exp.company} | {exp.date}
              </div>
              {exp.description && exp.description[0] && (
                <ul style={{ marginLeft: '14px', marginTop: '3px', fontSize: '9px', color: '#000000' }}>
                  {exp.description.map((desc: string, j: number) => (
                    <li key={j} style={{ marginBottom: '2px', lineHeight: '1.4' }}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' }}>
            Education
          </h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} style={{ fontSize: '9px', color: '#000000', marginBottom: '4px' }}>
              <span style={{ fontWeight: 'bold' }}>{edu.degree}</span> | {edu.institution || edu.school} | {edu.date}
              {edu.gpa && ` | GPA: ${edu.gpa}`}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '6px', textTransform: 'uppercase' }}>
            Projects
          </h2>
          {data.projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: '8px', fontSize: '9px', color: '#000000' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{proj.name}</div>
              <div style={{ lineHeight: '1.4' }}>{proj.description}</div>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '4px', textTransform: 'uppercase' }}>
            Certifications
          </h2>
          {data.certifications.map((cert: any, i: number) => (
            <div key={i} style={{ fontSize: '9px', color: '#000000', marginBottom: '3px' }}>
              {cert.name} | {cert.issuer} | {cert.date}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
