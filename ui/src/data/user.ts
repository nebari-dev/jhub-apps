import { UserState } from '../types/user';

export const currentUser: UserState = {
  name: 'testuser1@email.com',
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
  share_permissions: {
    users: ['alpha@example.com', 'admin', 'testuser', 'john@doe.com'],
    groups: ['developer', 'superadmin'],
  },
};
