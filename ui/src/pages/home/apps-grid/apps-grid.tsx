import { Box, Stack } from '@mui/material';
import { JhApp } from '@src/types/jupyterhub';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { getApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentUser as defaultUser,
} from '../../../store';
import { Item } from '../../../styles/styled-item';
import AppCard from '../app-card/app-card';

interface AppsGridProps {
  appType?: 'My' | 'Shared';
  filter: string;
}

export const AppsGrid = ({
  appType = 'My',
  filter,
}: AppsGridProps): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
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
    enabled: !!currentUser,
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
    <Box>
      <Stack>
        <Item>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: '48px',
            }}
          >
            <div className="grid-heading-left">
              <h2>{appType} Apps</h2>
            </div>
            <div className="grid-heading-center">
              <hr className="grid-spacer"></hr>
            </div>
            <div className="grid-heading-right">
              <h2>{apps.length} apps</h2>
            </div>
          </Box>
        </Item>
        <Item>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'flex-start',
              paddingBottom: '48px',
            }}
          >
            {isLoading ? (
              <div className="font-bold">Loading...</div>
            ) : apps.length > 0 ? (
              <>
                {apps.map((app: JhApp) => (
                  <AppCard
                    name={userData.displayName || ''}
                    id={app.id}
                    key={`app-${app.id}`}
                    title={app.name}
                    description={app.description}
                    thumbnail={app.thumbnail}
                    framework={app.framework}
                    url={app.url}
                    ready={app.ready}
                    serverStatus={app.status}
                    username={app.username}
                    isPublic={app.public}
                    isShared={appType === 'Shared' ? true : false}
                  />
                ))}
              </>
            ) : (
              <div>No apps available</div>
            )}
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};
