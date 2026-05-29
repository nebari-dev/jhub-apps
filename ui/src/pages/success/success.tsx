import type { UserState } from '@src/types/user';
import { APP_BASE_URL } from '@src/utils/constants';
import type React from 'react';
import { type SyntheticEvent, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { currentUser as defaultUser } from '../../store';

export const Success = (): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [searchParams] = useSearchParams();
  const username = currentUser?.name;
  const server = searchParams.get('id') || '';

  const handleNavigate = (event: SyntheticEvent) => {
    event.preventDefault();
    // Assume this page is only used when headless and inside an iframe
    window.parent.open(
      `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
      '_blank',
    );
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="container flex h-[100ch]">
      <div className="flex flex-col">
        <div>
          <h1 className="text-2xl font-normal">App Submitted Successfully!</h1>
          <p className="max-w-[600px] pb-[30px]">
            To view the status of your app deployment, please click{' '}
            <a
              href="#"
              onClick={handleNavigate}
              className="form-paragraph-link"
            >
              here
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};
