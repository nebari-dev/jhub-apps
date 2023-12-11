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

export interface AppCreate {
  servername: string;
  user_options: UserOptions;
}

export interface AppDelete {
  id: string;
}
