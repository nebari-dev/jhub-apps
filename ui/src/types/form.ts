import { SharePermissions } from './api';

export interface FormInput {
  username: string;
  password: string;
}

export interface AppFormInput {
  conda_env?: string;
  custom_command?: string;
  description?: string;
  display_name: string;
  env?: string;
  filepath?: string;
  framework: string;
  is_public: boolean;
  keep_alive: boolean;
  jhub_app: boolean;
  profile?: string;
  thumbnail?: string;
  share_with: SharePermissions;
  repository?: {
    url: string;
    config_directory?: string; //conda_project_yml
    ref?: string; // branch
  };
}

export interface AppSharingItem {
  name: string;
  type: 'user' | 'group';
}

export interface AppFormProps {
  deployOption?: string;
  id?: string;
  isEditMode: boolean;
}

export interface RepoData {
  display_name: string;
  description: string;
  thumbnail: string; // Base64 encoded image string
  filepath: string;
  framework: string;
  custom_command: string;
  conda_project_yml: string;
  env: {
    conda_env: string;
    SOMETHING_BAR: string;
    SOMETHING_FOO: string;
  };
  keep_alive: boolean;
  public: boolean;
  repository: {
    config_directory: string;
    ref: string;
    url: string;
  };
}
