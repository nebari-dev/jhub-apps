import type { SharePermissions, UserOptions } from './api';

export interface JhData {
  admin_access: boolean;
  base_url: string;
  options_form: boolean;
  prefix: string;
  user: string;
  xsrf_token: string;
  logo?: string;
}

export interface JhApp {
  id: string;
  name: string;
  description?: string;
  framework: string;
  profile?: string;
  url: string;
  thumbnail?: string;
  username?: string;
  ready: boolean;
  public: boolean;
  shared: boolean;
  last_activity: Date | string;
  pending?: boolean | null;
  stopped?: boolean;
  status: string;
  full_name?: string;
  share_with?: SharePermissions;
}

export interface JhServiceApp {
  id: string;
  name: string;
  description?: string;
  framework: string;
  url: string;
  thumbnail?: string;
  username?: string;
  status: string;
}

export interface JhService {
  name: string;
  description?: string;
  url: string;
  external: boolean;
  pinned: boolean;
  thumbnail?: string;
}

export interface JhServiceInfo {
  name?: string;
  description?: string;
  url?: string;
  external?: boolean;
  pinned?: boolean;
  thumbnail?: string;
}

export interface JhServiceFull {
  prefix: string;
  kind: string;
  info: JhServiceInfo;
  admin: boolean;
  display: boolean;
  roles: string[];
  pid: number;
  url: string;
  name: string;
  command: string[];
}

export interface JhServer {
  name: string;
  url?: string;
  started?: string | null;
  pending?: boolean | null;
  ready?: boolean;
  last_activity: Date | string;
  stopped?: boolean;
  shared?: boolean;
  username?: string;
  user_options?: Partial<UserOptions> & {
    name?: string;
    username?: string;
  };
}

export interface JhServerData {
  user_apps: JhServer[];
  shared_apps: JhServer[];
}
