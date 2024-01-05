export interface FormInput {
  username: string;
  password: string;
}

export interface AppFormInput {
  display_name: string;
  framework: string;
  jhub_app: boolean;
  filepath?: string;
  thumbnail?: string;
  description?: string;
  conda_env?: string;
  custom_command?: string;
  profile?: string;
  is_public: boolean;
}
