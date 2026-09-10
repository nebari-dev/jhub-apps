export const APP_TITLE = 'JupyterHub';
export const APP_BASE_URL = process.env.APP_BASE_URL || '/';
export const API_BASE_URL = process.env.API_BASE_URL || '/';
export const REQUIRED_FIELD_MESSAGE = 'This field is required.';

export const REQUIRED_FORM_FIELDS_RULES = {
  required: REQUIRED_FIELD_MESSAGE,
};

export const OWNERSHIP_TYPES = ['Any', 'Owned by me', 'Shared with me'];
export const SORT_TYPES = ['Recently modified', 'Name: A-Z', 'Name: Z-A'];
export const SERVER_STATUSES = ['Running', 'Ready', 'Pending', 'Unknown'];

export const APP_TO_START_KEY = 'startAppId';

// localStorage key for the light/dark/system preference. Pre-dates the
// @nebari/use-theme-preference hook; kept so existing users keep their choice.
export const THEME_STORAGE_KEY = 'jhub-apps:color-mode';
