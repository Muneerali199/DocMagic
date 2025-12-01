export function AcademicTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Times New Roman, serif', lineHeight: '1.6' }}>
      {/* Academic Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '12px', borderBottom: '1px solid #000000' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 'bold', color: '#000000', marginBottom: '8px' }}>
          {data.name}
        </h1>
        <div style={{ fontSize: '10px', color: '#000000', lineHeight: '1.8' }}>
          <div>{data.email} • {data.phone}</div>
          <div>{data.location}</div>
          {(data.linkedin || data.github) && (
            <div>
              {data.linkedin && <span>{data.linkedin}</span>}
              {data.linkedin && data.github && <span> • </span>}
              {data.github && <span>{data.github}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Research Interests / Summary */}
      {data.summary && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase' }}>
            Professional Profile
          </h2>
          <p style={{ fontSize: '11px', color: '#000000', lineHeight: '1.7', textAlign: 'justify' }}>
            {data.summary}
          </p>
        </div>
      )}

      {/* Education - First for Academic */}
      {data.education && data.education.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            Education
          </h2>
          {data.education.map((edu: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>
                    {edu.degree}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                    {edu.institution || edu.school}
                  </p>
                </div>
                <div style={{ fontSize: '11px', color: '#000000', textAlign: 'right' }}>
                  {edu.date}
                </div>
              </div>
              {edu.gpa && (
                <p style={{ fontSize: '10px', color: '#000000', marginTop: '2px' }}>
                  GPA: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Professional Experience */}
      {data.experience && data.experience.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            Professional Experience
          </h2>
          {data.experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>
                    {exp.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#000000', fontStyle: 'italic' }}>
                    {exp.company}, {exp.location}
                  </p>
                </div>
                <div style={{ fontSize: '11px', color: '#000000', textAlign: 'right' }}>
                  {exp.date}
                </div>
              </div>
              {exp.description && exp.description[0] && (
                <ul style={{ marginLeft: '20px', marginTop: '6px', fontSize: '10px', color: '#000000' }}>
                  {exp.description.map((desc: string, j: number) => (
                    <li key={j} style={{ marginBottom: '4px', lineHeight: '1.6' }}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Research Projects / Projects */}
      {data.projects && data.projects.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            Research & Projects
          </h2>
          {data.projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '4px' }}>
                {proj.name}
              </h3>
              <p style={{ fontSize: '10px', color: '#000000', lineHeight: '1.6', textAlign: 'justify' }}>
                {proj.description}
              </p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p style={{ fontSize: '10px', color: '#000000', marginTop: '3px', fontStyle: 'italic' }}>
                  <span style={{ fontWeight: 'bold' }}>Technologies:</span> {proj.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Technical Skills */}
      {data.skills && (
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            Technical Skills
          </h2>
          <div style={{ fontSize: '10px', color: '#000000', lineHeight: '1.8' }}>
            {data.skills.programming && data.skills.programming.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Programming Languages: </span>
                {data.skills.programming.join(', ')}
              </div>
            )}
            {data.skills.technical && data.skills.technical.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Technologies & Frameworks: </span>
                {data.skills.technical.join(', ')}
              </div>
            )}
            {data.skills.tools && data.skills.tools.length > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold' }}>Tools & Platforms: </span>
                {data.skills.tools.join(', ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Certifications & Awards */}
      {data.certifications && data.certifications.length > 0 && (
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            Certifications & Awards
          </h2>
          {data.certifications.map((cert: any, i: number) => (
            <div key={i} style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: '#000000' }}>
                <span style={{ fontWeight: 'bold' }}>{cert.name}</span>, {cert.issuer}, {cert.date}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
