export interface SharePermissions {
  users: string[];
  groups: string[];
}

export interface KeyValuePair {
  key: string;
  value: string;
}

export interface UserOptions {
  name?: string;
  jhub_app: boolean;
  display_name: string;
  description: string;
  thumbnail: string;
  filepath: string;
  framework: string;
  custom_command?: string;
  conda_env: string;
  profile: string;
  profile_image?: string;
  public: boolean;
  share_with: SharePermissions;
  keep_alive: boolean;
  env: Record<string, string> | null;
  repository?: {
    url: string;
  };
}

export interface ServerApp {
  name: string;
  url: string;
  started?: string | null;
  ready: boolean;
  pending?: boolean | null;
  stopped?: boolean;
  last_activity: Date;
  username?: string;
  shared?: boolean;
  user_options?: Partial<UserOptions>;
}

export interface ServersData {
  user_apps: ServerApp[];
  shared_apps: ServerApp[];
}

export interface AppQueryUpdateProps {
  servername: string;
  user_options: UserOptions;
}

export interface AppQueryPostProps {
  id: string;
  full_name?: string;
}

export interface AppQueryDeleteProps {
  id: string;
  remove: boolean;
}

export interface AppQueryGetProps {
  name: string;
  last_activity: string;
  pending: null;
  ready: boolean;
  started: string;
  stopped: boolean;
  url: string;
  user_options: UserOptions;
  progress_url: string;
  state: Record<string, unknown>;
  defaultBranch?: string;
  condaPath?: string;
}

export interface AppFrameworkProps {
  name: string;
  display_name: string;
  logo: string;
}

export interface AppProfileProps {
  display_name: string;
  slug: string;
  description: string;
  default?: boolean;
  kubespawner_override?: {
    image?: string;
    cpu_limit?: number;
    cpu_guarantee?: number;
    mem_limit?: string;
    mem_guarantee?: string;
  };
}
