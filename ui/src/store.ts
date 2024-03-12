import { UserState } from '@src/types/user';
import { atom } from 'recoil';
import { AppFormInput } from './types/form';
import { JhData } from './types/jupyterhub';

const currentUser = atom<UserState | undefined>({
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

const currentFormInput = atom<AppFormInput | undefined>({
  key: 'currentFormInput',
  default: undefined,
});

const currentImage = atom<string | undefined>({
  key: 'currentImage',
  default: undefined,
});

const currentFile = atom<File | undefined>({
  key: 'currentFile',
  default: undefined,
});

export {
  currentFile,
  currentFormInput,
  currentImage,
  currentJhData,
  currentNotification,
  currentUser,
};
