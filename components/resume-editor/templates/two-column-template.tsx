export function TwoColumnTemplate({ data }: { data: any }) {
  return (
    <div style={{ color: '#000000', fontFamily: 'Arial, sans-serif', lineHeight: '1.5', display: 'flex', gap: '24px' }}>
      {/* Left Column - 35% */}
      <div style={{ width: '35%', borderRight: '2px solid #000000', paddingRight: '20px' }}>
        {/* Name */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', lineHeight: '1.2' }}>
            {data.name}
          </h1>
        </div>

        {/* Contact */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
            CONTACT
          </h2>
          <div style={{ fontSize: '9px', color: '#000000', lineHeight: '1.6' }}>
            {data.email && <div style={{ marginBottom: '4px', wordBreak: 'break-all' }}>{data.email}</div>}
            {data.phone && <div style={{ marginBottom: '4px' }}>{data.phone}</div>}
            {data.location && <div style={{ marginBottom: '4px' }}>{data.location}</div>}
            {data.linkedin && <div style={{ marginBottom: '4px', wordBreak: 'break-all' }}>{data.linkedin}</div>}
            {data.github && <div style={{ wordBreak: 'break-all' }}>{data.github}</div>}
          </div>
        </div>

        {/* Skills */}
        {data.skills && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
              SKILLS
            </h2>
            <div style={{ fontSize: '9px', color: '#000000' }}>
              {data.skills.programming && data.skills.programming.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Programming</div>
                  {data.skills.programming.map((skill: string, i: number) => (
                    <div key={i} style={{ marginBottom: '2px' }}>• {skill}</div>
                  ))}
                </div>
              )}
              {data.skills.technical && data.skills.technical.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Technical</div>
                  {data.skills.technical.map((skill: string, i: number) => (
                    <div key={i} style={{ marginBottom: '2px' }}>• {skill}</div>
                  ))}
                </div>
              )}
              {data.skills.tools && data.skills.tools.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>Tools</div>
                  {data.skills.tools.map((skill: string, i: number) => (
                    <div key={i} style={{ marginBottom: '2px' }}>• {skill}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
              EDUCATION
            </h2>
            {data.education.map((edu: any, i: number) => (
              <div key={i} style={{ marginBottom: '12px', fontSize: '9px', color: '#000000' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>{edu.degree}</div>
                <div style={{ marginBottom: '2px' }}>{edu.institution || edu.school}</div>
                <div style={{ marginBottom: '2px' }}>{edu.date}</div>
                {edu.gpa && <div>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase', borderBottom: '1px solid #000000', paddingBottom: '4px' }}>
              CERTIFICATIONS
            </h2>
            {data.certifications.map((cert: any, i: number) => (
              <div key={i} style={{ marginBottom: '8px', fontSize: '9px', color: '#000000' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{cert.name}</div>
                <div>{cert.issuer} • {cert.date}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - 65% */}
      <div style={{ width: '65%' }}>
        {/* Summary */}
        {data.summary && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '8px', textTransform: 'uppercase' }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p style={{ fontSize: '10px', color: '#000000', lineHeight: '1.6', textAlign: 'justify' }}>
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>
              WORK EXPERIENCE
            </h2>
            {data.experience.map((exp: any, i: number) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '2px' }}>
                    {exp.title}
                  </h3>
                  <div style={{ fontSize: '10px', color: '#000000', fontStyle: 'italic' }}>
                    {exp.company} | {exp.location} | {exp.date}
                  </div>
                </div>
                {exp.description && exp.description[0] && (
                  <ul style={{ marginLeft: '16px', marginTop: '6px', fontSize: '10px', color: '#000000' }}>
                    {exp.description.map((desc: string, j: number) => (
                      <li key={j} style={{ marginBottom: '3px', lineHeight: '1.5' }}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', marginBottom: '12px', textTransform: 'uppercase' }}>
              KEY PROJECTS
            </h2>
            {data.projects.map((proj: any, i: number) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', color: '#000000', marginBottom: '3px' }}>
                  {proj.name}
                </h3>
                <p style={{ fontSize: '10px', color: '#000000', marginBottom: '3px', lineHeight: '1.5' }}>
                  {proj.description}
                </p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p style={{ fontSize: '9px', color: '#000000', fontStyle: 'italic' }}>
                    Technologies: {proj.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
