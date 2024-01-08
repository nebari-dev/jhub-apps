import { JhApp, JhData } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { getApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentJhData, currentNotification } from '../../../store';
import AppCard from '../app-card/app-card';
interface AppsGridProps {
  appType?: 'My' | 'Shared';
  filter: string;
}

export const AppsGrid = ({
  appType = 'My',
  filter,
}: AppsGridProps): React.ReactElement => {
  const [jHData] = useRecoilState<JhData>(currentJhData);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [apps, setApps] = useState<JhApp[]>([]);

  const {
    isLoading,
    error,
    data: serverData,
  } = useQuery<UserState, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get(`/server/`)
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!jHData.user,
  });

  useEffect(() => {
    if (!isLoading && serverData) {
      const filterToLower = filter.toLowerCase();
      setApps(() =>
        getApps(serverData, appType).filter(
          (app) =>
            app.name.toLowerCase().includes(filterToLower) ||
            app.description?.toLowerCase().includes(filterToLower) ||
            app.framework?.toLowerCase().includes(filterToLower),
        ),
      );
    }
  }, [isLoading, serverData, appType, filter]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <>
      <div className="container w-full flex flex-align-center pb-12">
        <div className="grid-heading-left w-full">
          <h2 className="whitespace-nowrap font-bold">{appType} Apps</h2>
        </div>
        <div className="grid-heading-center w-full">
          <hr className="grid-spacer"></hr>
        </div>
        <div className="grid-heading-right flex justify-end w-full">
          <h2 className="whitespace-nowrap font-bold">{apps.length} apps</h2>
        </div>
      </div>
      <div className="container grid pb-12">
        {apps.length > 0 ? (
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
                ready={app.ready}
                username={app.username}
                isPublic={app.public}
                isShared={appType === 'Shared' ? true : false}
              />
            ))}
          </div>
        ) : (
          <div>No apps available</div>
        )}
      </div>
    </>
  );
};
