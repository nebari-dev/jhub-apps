import { User } from '@src/types/user';
import { atom } from 'recoil';

const currentUser = atom<User | undefined>({
  key: 'currentUser',
  default: undefined,
});

export { currentUser };
