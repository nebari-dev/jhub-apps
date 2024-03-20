/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserState {
  admin: boolean;
  auth_state: string | null;
  created: string | null;
  groups: string[];
  kind: string | null;
  last_activity: string | null;
  name: string;
  pending: boolean | null;
  roles: string[];
  scopes: string[];
  server: string | null;
  servers: any;
  session_id: string | null;
}
