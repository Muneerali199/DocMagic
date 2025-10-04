// Pages that can be browsed without authentication
export const BROWSABLE_PAGES = [
  '/',
  '/about',
  '/contact',
  '/pricing',
  '/documentation',
  '/templates', // Can view templates but not create/edit
  '/auth/signin',
  '/auth/register',
];

// Pages that require full authentication
export const PROTECTED_PAGES = [
  '/profile',
  '/settings',
  '/payment-demo',
];

export const AUTH_ROUTES = [
  '/auth/signin',
  '/auth/register',
];

// Activities that require authentication (used for component-level protection)
export const PROTECTED_ACTIVITIES = {
  CREATE_DOCUMENT: 'create_document',
  EDIT_DOCUMENT: 'edit_document',
  SAVE_DOCUMENT: 'save_document',
  DOWNLOAD_DOCUMENT: 'download_document',
  CREATE_TEMPLATE: 'create_template',
  EDIT_TEMPLATE: 'edit_template',
  SAVE_TEMPLATE: 'save_template',
  ACCESS_PROFILE: 'access_profile',
  CHANGE_SETTINGS: 'change_settings',
  MAKE_PAYMENT: 'make_payment',
  UPLOAD_FILE: 'upload_file',
};
