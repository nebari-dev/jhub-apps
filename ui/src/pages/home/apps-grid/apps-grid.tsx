import { AppCard } from '@src/components';
import { JhApp, JhData } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { getApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentJhData, currentNotification } from 'src/store';
interface AppsGridProps {
  appType?: 'My' | 'Shared';
}

export const AppsGrid = ({
  appType = 'My',
}: AppsGridProps): React.ReactElement => {
  const [jHData] = useRecoilState<JhData>(currentJhData);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [apps, setApps] = useState<JhApp[]>([]);

  const {
    isLoading,
    error,
    data: userData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['user-state'],
    queryFn: () =>
      axios
        .get(`/users/${jHData.user}`, {
          params: {
            include_stopped_servers: 'True',
          },
        })
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!jHData.user,
  });

  useEffect(() => {
    if (!isLoading && userData) {
      setApps(() => getApps(userData, appType));
    }
  }, [isLoading, userData, appType]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <>
      <div className="container grid grid-cols-12 flex flex-align-center pb-12">
        <div className="col-span-1">
          <h4 className="whitespace-nowrap font-bold">{appType} Apps</h4>
        </div>
        <div className="col-span-10">
          <hr className="spacer"></hr>
        </div>
        <div className="col-span-1 flex justify-end">
          <h4 className="whitespace-nowrap font-bold">{apps.length} apps</h4>
        </div>
      </div>
      <div className="container grid pb-12">
        <div className="flex flex flex-row flex-wrap gap-4">
          {apps.map((app: JhApp) => (
            <AppCard
              id={app.id}
              key={`app-${app.id}`}
              title={app.name}
              description={app.description}
              thumbnail={app.thumbnail}
              framework={app.framework}
              url={app.url}
            />
          ))}
        </div>
      </div>
    </>
  );
};
