export function ExecutiveTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Georgia, serif', lineHeight: '1.6' }}>
      {/* Executive Header - Centered with Lines */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ borderTop: '4px double #000000', paddingTop: '16px', borderBottom: '4px double #000000', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', letterSpacing: '3px' }}>
            {data.name}
          </h1>
          <div style={{ fontSize: '11px', color: '#000000', letterSpacing: '1px' }}>
            {data.email && <span style={{ marginRight: '16px' }}>{data.email}</span>}
            {data.phone && <span style={{ marginRight: '16px' }}>•  {data.phone}</span>}
            {data.location && <span style={{ marginRight: '16px' }}>•  {data.location}</span>}
          </div>
          {(data.linkedin || data.github) && (
            <div style={{ fontSize: '11px', color: '#000000', marginTop: '6px', letterSpacing: '1px' }}>
              {data.linkedin && <span style={{ marginRight: '16px' }}>{data.linkedin}</span>}
              {data.github && <span>•  {data.github}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary */}
      {data.summary && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Executive Summary
          </h2>
          <p style={{ fontSize: '11px', color: '#000000', lineHeight: '1.8', textAlign: 'justify', textIndent: '24px' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '16px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
            Professional Experience
          </h2>
          {data.experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
                  {exp.title}
                </h3>
                <div style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                  {exp.company} • {exp.location}
                </div>
                <div style={{ fontSize: '10px', color: '#000000', marginTop: '2px' }}>
                  {exp.date}
                </div>
              </div>
              {exp.description && exp.description[0] && (
                <ul style={{ marginLeft: '32px', marginTop: '8px', fontSize: '11px', color: '#000000', listStyleType: 'disc' }}>
                  {exp.description.map((desc: string, j: number) => (
                    <li key={j} style={{ marginBottom: '6px', lineHeight: '1.6' }}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '16px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
            Education
          </h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
                {edu.degree}
              </h3>
              <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                {edu.institution || edu.school}
              </p>
              <p style={{ fontSize: '10px', color: '#000000' }}>
                {edu.date}{edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Core Competencies */}
      {data.skills && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '16px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
            Core Competencies
          </h2>
          <div style={{ fontSize: '11px', color: '#000000', textAlign: 'center', lineHeight: '2' }}>
            {data.skills.programming && data.skills.programming.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {data.skills.programming.join(' • ')}
              </div>
            )}
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {data.skills.technical.join(' • ')}
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div>
                {data.skills.tools.join(' • ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '16px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
            Notable Projects
          </h2>
          {data.projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '6px', textAlign: 'center' }}>
                {proj.name}
              </h3>
              <p style={{ fontSize: '11px', color: '#000000', lineHeight: '1.6', textAlign: 'justify', marginBottom: '4px' }}>
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p style={{ fontSize: '10px', color: '#000000', textAlign: 'center', fontStyle: 'italic' }}>
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
          <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#000000', marginBottom: '16px', textAlign: 'center', letterSpacing: '2px', textTransform: 'uppercase', borderBottom: '2px solid #000000', paddingBottom: '8px' }}>
            Professional Certifications
          </h2>
          <div style={{ textAlign: 'center' }}>
            {data.certifications.map((cert: any, i: number) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '11px', color: '#000000' }}>
                <span style={{ fontWeight: 'bold' }}>{cert.name}</span> • {cert.issuer} • {cert.date}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
