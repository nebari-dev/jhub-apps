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
  public: boolean;
}

export interface AppQueryUpdateProps {
  servername: string;
  user_options: UserOptions;
}

export interface AppQueryPostProps {
  id: string;
}

export interface AppQueryDeleteProps {
  id: string;
  remove: boolean;
}

export interface AppQueryGetProps {
  name: string;
  last_activity: string;
  started: null;
  pending: null;
  ready: boolean;
  stopped: boolean;
  url: string;
  user_options: UserOptions;
  progress_url: string;
  state: Record<string, unknown>;
}

export interface AppFrameworkProps {
  name: string;
  display_name: string;
  logo: string;
}

export interface AppProfileProps {
  display_name: string;
  slug: string;
}
