// Export Supabase database types
export * from './supabase';

// Export application types
export type { Database } from './supabase';

export type {
  Template,
  TemplateType,
  TemplateShare,
  UserProfile,
  TemplateWithShares,
  TemplatePreviewProps,
  TemplateGalleryProps,
  TemplateSharingSettingsProps,
} from './app.types';

// Export any other types from declaration files
export * from './index.d';
