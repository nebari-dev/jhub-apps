export const APP_TITLE = 'JupyterHub';
export const APP_BASE_URL = process.env.APP_BASE_URL || '/';
export const API_BASE_URL = process.env.API_BASE_URL || '/';
export const REQUIRED_FIELD_MESSAGE = 'This field is required.';

export const REQUIRED_FORM_FIELDS_RULES = {
  required: REQUIRED_FIELD_MESSAGE,
};

export const DEFAULT_PINNED_SERVICES: string[] = ['Environments'];

export const OWNERSHIP_TYPES = ['Any', 'Owned by me', 'Shared with me'];
export const SORT_TYPES = ['Recently modified', 'Name: A-Z', 'Name: Z-A'];
