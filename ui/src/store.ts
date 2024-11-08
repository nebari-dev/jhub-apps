import { UserState } from '@src/types/user';
import { atom } from 'recoil';
import { AppProfileProps } from './types/api';
import { AppFormInput } from './types/form';
import { JhApp, JhData } from './types/jupyterhub';

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

const currentApp = atom<JhApp | undefined>({
  key: 'currentApp',
  default: undefined,
});

const currentServerName = atom<string | undefined>({
  key: 'currentServerName',
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

const currentSearchValue = atom<string>({
  key: 'currentSearchValue',
  default: '',
});

const currentFrameworks = atom<string[]>({
  key: 'currentFrameworks',
  default: [],
});

const currentProfiles = atom<AppProfileProps[]>({
  key: 'currentProfiles',
  default: [],
});

const currentOwnershipValue = atom<string>({
  key: 'currentOwnershipValue',
  default: 'Any',
});

const currentSortValue = atom<string>({
  key: 'currentSortValue',
  default: 'Recently modified',
});

const currentServerStatuses = atom<string[]>({
  key: 'currentServerStatuses',
  default: [],
});

const isStartOpen = atom<boolean>({
  key: 'isStartOpen',
  default: false,
});

const isStopOpen = atom<boolean>({
  key: 'isStopOpen',
  default: false,
});

const isDeleteOpen = atom<boolean>({
  key: 'isDeleteOpen',
  default: false,
});

const isStartNotRunningOpen = atom<boolean>({
  key: 'isStartNotRunningOpen',
  default: false,
});

const isHeadless = atom<boolean>({
  key: 'isHeadless',
  default: false,
});

export {
  currentApp,
  currentFile,
  currentFormInput,
  currentFrameworks,
  currentImage,
  currentJhData,
  currentNotification,
  currentOwnershipValue,
  currentProfiles,
  currentSearchValue,
  currentServerName,
  currentServerStatuses,
  currentSortValue,
  currentUser,
  isDeleteOpen,
  isHeadless,
  isStartNotRunningOpen,
  isStartOpen,
  isStopOpen,
};
