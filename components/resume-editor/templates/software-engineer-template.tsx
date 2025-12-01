export function SoftwareEngineerTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #000000' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {data.name}
        </h1>
        <div style={{ fontSize: '11px', color: '#000000', marginTop: '8px' }}>
          {data.email && <span style={{ marginRight: '12px' }}>{data.email}</span>}
          {data.phone && <span style={{ marginRight: '12px' }}>|  {data.phone}</span>}
          {data.location && <span style={{ marginRight: '12px' }}>|  {data.location}</span>}
          {data.linkedin && <span style={{ marginRight: '12px' }}>|  {data.linkedin}</span>}
          {data.github && <span>|  {data.github}</span>}
        </div>
      </div>

      {/* Technical Skills - First for Tech Roles */}
      {data.skills && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            TECHNICAL SKILLS
          </h2>
          <div style={{ fontSize: '11px', color: '#000000' }}>
            {data.skills.programming && data.skills.programming.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>Programming Languages: </span>
                <span>{data.skills.programming.join(', ')}</span>
              </div>
            )}
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>Frameworks & Technologies: </span>
                <span>{data.skills.technical.join(', ')}</span>
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div style={{ marginBottom: '6px' }}>
                <span style={{ fontWeight: 'bold' }}>Tools & Platforms: </span>
                <span>{data.skills.tools.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            PROFESSIONAL SUMMARY
          </h2>
          <p style={{ fontSize: '11px', color: '#000000', lineHeight: '1.6', textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            WORK EXPERIENCE
          </h2>
          {data.experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>
                    {exp.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                    {exp.company}{exp.location && ` • ${exp.location}`}
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: '#000000', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {exp.date}
                </span>
              </div>
              {exp.description && exp.description[0] && (
                <ul style={{ marginLeft: '20px', marginTop: '6px', fontSize: '11px', color: '#000000' }}>
                  {exp.description.map((desc: string, j: number) => (
                    <li key={j} style={{ marginBottom: '4px', lineHeight: '1.5' }}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            PROJECTS
          </h2>
          {data.projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
                {proj.name}
              </h3>
              <p style={{ fontSize: '11px', color: '#000000', marginBottom: '4px', lineHeight: '1.5' }}>
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p style={{ fontSize: '11px', color: '#000000' }}>
                  <span style={{ fontWeight: 'bold' }}>Technologies: </span>
                  {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            EDUCATION
          </h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
                    {edu.degree}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                    {edu.institution || edu.school}{edu.location && ` • ${edu.location}`}
                  </p>
                </div>
                <span style={{ fontSize: '11px', color: '#000000', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  {edu.date}
                </span>
              </div>
              {edu.gpa && (
                <p style={{ fontSize: '11px', color: '#000000', marginTop: '2px' }}>GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            CERTIFICATIONS
          </h2>
          {data.certifications.map((cert: any, i: number) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000' }}>
                  {cert.name}
                </span>
                <span style={{ fontSize: '11px', color: '#000000' }}>
                  {cert.date}
                </span>
              </div>
              {cert.issuer && (
                <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                  {cert.issuer}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
