export function ModernMinimalTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: '1.5' }}>
      {/* Minimalist Header - Left Aligned */}
      <div style={{ marginBottom: '32px', borderBottom: '3px solid #000000', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#000000', marginBottom: '4px', letterSpacing: '2px' }}>
          {data.name}
        </h1>
        <div style={{ fontSize: '10px', color: '#000000', marginTop: '8px', letterSpacing: '0.5px' }}>
          {data.email && <span style={{ marginRight: '16px' }}>{data.email}</span>}
          {data.phone && <span style={{ marginRight: '16px' }}>{data.phone}</span>}
          {data.location && <span style={{ marginRight: '16px' }}>{data.location}</span>}
          {data.linkedin && <span style={{ marginRight: '16px' }}>{data.linkedin}</span>}
          {data.github && <span>{data.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '11px', color: '#000000', lineHeight: '1.7', textAlign: 'justify', fontStyle: 'italic' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '2px' }}>
            EXPERIENCE
          </h2>
          {data.experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: '16px', paddingLeft: '16px', borderLeft: '2px solid #000000' }}>
              <div style={{ marginBottom: '4px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', display: 'inline' }}>
                  {exp.title}
                </h3>
                <span style={{ fontSize: '11px', color: '#000000', marginLeft: '8px' }}>
                  @ {exp.company}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#000000', marginBottom: '6px' }}>
                {exp.date} • {exp.location}
              </div>
              {exp.description && exp.description[0] && (
                <ul style={{ marginLeft: '16px', marginTop: '6px', fontSize: '10px', color: '#000000', listStyleType: 'square' }}>
                  {exp.description.map((desc: string, j: number) => (
                    <li key={j} style={{ marginBottom: '3px', lineHeight: '1.5' }}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '2px' }}>
            EDUCATION
          </h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px', paddingLeft: '16px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                {edu.degree}
              </h3>
              <p style={{ fontSize: '10px', color: '#000000' }}>
                {edu.institution || edu.school} • {edu.date}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '2px' }}>
            SKILLS
          </h2>
          <div style={{ fontSize: '10px', color: '#000000', paddingLeft: '16px' }}>
            {data.skills.programming && data.skills.programming.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                {data.skills.programming.join(' • ')}
              </div>
            )}
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                {data.skills.technical.join(' • ')}
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                {data.skills.tools.join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '2px' }}>
            PROJECTS
          </h2>
          {data.projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px', paddingLeft: '16px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '3px' }}>
                {proj.name}
              </h3>
              <p style={{ fontSize: '10px', color: '#000000', marginBottom: '3px', lineHeight: '1.5' }}>
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p style={{ fontSize: '9px', color: '#000000' }}>
                  {proj.technologies.join(' • ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '2px' }}>
            CERTIFICATIONS
          </h2>
          <div style={{ paddingLeft: '16px' }}>
            {data.certifications.map((cert: any, i: number) => (
              <div key={i} style={{ fontSize: '10px', color: '#000000', marginBottom: '4px' }}>
                {cert.name} • {cert.issuer} • {cert.date}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
