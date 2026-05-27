export { detectVersion, isSupported, isDeprecated } from './version-router';
export { addDeprecationHeaders, getDeprecationHeaderMap } from './deprecation';
export type { ApiVersion, VersionConfig, V1ResumeInput, V2ResumeInput, V1DocumentInput, V2DocumentInput } from './types';
export { VERSION_CONFIGS } from './types';

import type { V1ResumeInput, V2ResumeInput, V1DocumentInput, V2DocumentInput } from './types';

/**
 * Converts a v1 resume request body to the v2 shape expected by
 * app/api/generate/resume/route.ts.
 *
 * v1 → v2 field mapping:
 *   personalInfo.name  → name
 *   personalInfo.email → email
 *   jobTitle + yearsOfExperience + skills + additionalContext → prompt (constructed)
 */
export function convertV1ResumeToV2(body: V1ResumeInput): V2ResumeInput {
  const { personalInfo, jobTitle, yearsOfExperience, skills, additionalContext } = body;

  const article = /^[aeiou]/i.test(jobTitle) ? 'an' : 'a';
  const promptParts: string[] = [`Create a professional resume for ${article} ${jobTitle} position.`];

  if (yearsOfExperience !== undefined) {
    promptParts.push(`The candidate has ${yearsOfExperience} years of experience.`);
  }

  if (typeof skills === 'string' && skills) {
    const skillList = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .join(', ');
    // Guard against whitespace-only input producing "Key skills: ."
    if (skillList) promptParts.push(`Key skills: ${skillList}.`);
  }

  const trimmedContext = typeof additionalContext === 'string' ? additionalContext.trim() : undefined;
  if (trimmedContext) {
    promptParts.push(trimmedContext);
  }

  return {
    name: personalInfo.name,
    email: personalInfo.email,
    prompt: promptParts.join(' '),
  };
}

/**
 * Converts a v1 document request body to the v2 shape expected by
 * app/api/documents/route.ts.
 *
 * v1 → v2 field mapping:
 *   name  → title
 *   type  → documentType
 *   data  → content
 *   tags  → metadata
 *   parts → sections
 */
export function convertV1DocumentToV2(body: V1DocumentInput): V2DocumentInput {
  return {
    title: body.name,
    documentType: body.type,
    ...(body.data !== undefined && { content: body.data }),
    ...(body.tags !== undefined && { metadata: body.tags }),
    ...(body.parts !== undefined && { sections: body.parts }),
  };
}
