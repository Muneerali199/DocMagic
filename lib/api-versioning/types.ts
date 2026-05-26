export type ApiVersion = 'v1' | 'v2';

export interface VersionConfig {
  version: ApiVersion;
  deprecated: boolean;
  sunsetDate: string; // ISO 8601 date string e.g. "2026-12-31"
  migrationGuideUrl: string;
}

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export const VERSION_CONFIGS: Record<ApiVersion, VersionConfig> = {
  v1: {
    version: 'v1',
    deprecated: true,
    sunsetDate: '2026-12-31',
    migrationGuideUrl: `${SITE_ORIGIN}/docs/migration-v1-v2`,
  },
  v2: {
    version: 'v2',
    deprecated: false,
    sunsetDate: '',
    migrationGuideUrl: '',
  },
};

// V1 legacy input shapes (camelCase, flat personalInfo)
export interface V1ResumeInput {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  jobTitle: string;
  yearsOfExperience?: number;
  skills?: string; // comma-separated string in v1
  additionalContext?: string;
}

// V2 current input shapes
export interface V2ResumeInput {
  name: string;
  email: string;
  prompt: string;
}

// V1 legacy document input
export interface V1DocumentInput {
  name: string;          // was "title" in v2
  type: string;          // was "documentType" in v2
  data?: Record<string, unknown>;    // was "content" in v2
  tags?: Record<string, unknown>;    // was "metadata" in v2
  parts?: unknown[];     // was "sections" in v2
}

// V2 current document input
export interface V2DocumentInput {
  title: string;
  documentType: string;
  content?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  sections?: unknown[];
}
