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
}

export interface UserOptions {
  jhub_app: boolean;
  display_name: string;
  description: string;
  thumbnail: string;
  filepath: string;
  framework: string;
  custom_command: string;
  conda_env: string;
  profile: string;
}

export interface AppCreateProps {
  servername: string;
  user_options: UserOptions;
}

export interface AppDeleteProps {
  id: string;
}
