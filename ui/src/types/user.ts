import { SharePermissions } from './api';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface UserState {
  username: string | undefined;
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
  // No longer present in /user responses — fetch from
  // `GET /share-permissions/` instead. Kept optional so the type still
  // matches existing test fixtures.
  share_permissions?: SharePermissions;
}
