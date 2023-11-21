import { User } from '@src/types/user';
import { atom } from 'recoil';
import { JhData } from './types/jupyterhub';

const currentUser = atom<User | undefined>({
  key: 'currentUser',
  default: undefined,
});

const currentJhData = atom<JhData>({
  key: 'currentJhData',
  default: {
    admin_access: false,
    base_url: '/hub',
    options_form: false,
    prefix: '/',
    user: '',
    xsrf_token: '',
  },
});

const currentNotification = atom<string | undefined>({
  key: 'currentNotification',
  default: undefined,
});

export { currentJhData, currentNotification, currentUser };
