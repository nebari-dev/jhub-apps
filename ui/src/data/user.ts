import { UserState } from '../types/user';

export const currentUser: UserState = {
  name: 'test',
  admin: true,
  groups: [],
  roles: [],
  scopes: [],
  auth_state: null,
  servers: {},
  server: null,
  session_id: null,
  last_activity: null,
  pending: null,
  kind: null,
  created: null,
};
