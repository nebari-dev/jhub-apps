import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import { Box, Link, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query'; 
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { StatusChip } from '@src/components';
import { API_BASE_URL } from '@src/utils/constants';

import { AppProfileProps } from '@src/types/api';
import { JhApp } from '@src/types/jupyterhub';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentApp,
  currentNotification,
  currentProfiles as defaultProfiles,
  isDeleteOpen,
  isStartNotRunningOpen,
  isStartOpen,
  isStopOpen,
} from '../../store';
import ContextMenu, { ContextMenuItem } from '../context-menu/context-menu';
import './app-card.css';
import axios from 'axios';
import { UserState } from '@src/types/user';
interface AppCardProps {
  id: string;
  title: string;
  description?: string;
  framework: string;
  thumbnail?: string;
  url: string;
  username?: string;
  isPublic?: boolean;
  isShared?: boolean;
  serverStatus: string;
  lastModified?: Date;
  sx?: object;
  isAppCard?: boolean;
  app?: JhApp;
}

export const AppCard = ({
  id,
  title,
  description,
  framework,
  thumbnail,
  url,
  username,
  isPublic = false,
  isShared,
  serverStatus,
  lastModified,
  isAppCard = true,
  app,
}: AppCardProps): React.ReactElement => {
  const [appStatus, setAppStatus] = useState('');
  const [currentProfiles] = useRecoilState<AppProfileProps[]>(defaultProfiles);
  const [, setCurrentApp] = useRecoilState<JhApp | undefined>(currentApp);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [, setIsStartOpen] = useRecoilState<boolean>(isStartOpen);
  const [, setIsStopOpen] = useRecoilState<boolean>(isStopOpen);
  const [, setIsDeleteOpen] = useRecoilState<boolean>(isDeleteOpen);
  const [, setIsStartNotRunningOpen] = useRecoilState(isStartNotRunningOpen);


  useEffect(() => {
    if (serverStatus) {
      setAppStatus(serverStatus);
    }
  }, [serverStatus, setNotification]);

  // Fetch user data and check admin status
  const { data: currentUserData } = useQuery<UserState>({
    queryKey: ['current-user'],
    queryFn: () =>
      axios.get('/user').then((response) => {
        return response.data;
      }),
    enabled: true,
  });

  const getIcon = () => {
    if (!isAppCard)
      return (
        <PushPinRoundedIcon
          sx={{ fontSize: '18px', position: 'relative', bottom: '2px' }}
          data-testid="PushPinRoundedIcon"
        />
      );
    if (isPublic)
      return (
        <PublicRoundedIcon
          sx={{ fontSize: '18px' }}
          data-testid="PublicRoundedIcon"
        />
      );
    if (isShared)
      return (
        <GroupRoundedIcon
          sx={{ fontSize: '18px' }}
          data-testid="GroupRoundedIcon"
        />
      );
    return (
      <LockRoundedIcon
        sx={{ fontSize: '18px' }}
        data-testid="LockRoundedIcon"
      />
    );
  };

  const menuItems: ContextMenuItem[] = [
    {
      id: 'start',
      title: 'Start',
      onClick: () => {
        // Allow admins to start shared apps
        if (isShared && !currentUserData?.admin) {
          // Show error if it's a shared app
          setNotification('You don\'t have permission to start this app. Please ask the owner to start it.');
          return;
        }
        setIsStartOpen(true);
        setCurrentApp(app!); // Add the non-null assertion operator (!) to ensure that app is not undefined
      },
      visible: true,
      disabled: serverStatus !== 'Ready', // Disable start if the app is already running
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: () => {
        // Allow admins to stop shared apps
        if (isShared && !currentUserData?.admin) {
          setNotification('You don\'t have permission to stop this app. Please ask the owner to stop it.');
          return;
        }
        setIsStopOpen(true);
        setCurrentApp(app!); 
      },
      visible: true,
      disabled: serverStatus !== 'Running', // Disable stop if the app is not running
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () =>
        (window.location.href = `${API_BASE_URL}/edit-app?id=${id}`),
      visible: true,
      disabled: isShared || id === '' || !isAppCard,
    },
    {
      id: 'delete',
      title: 'Delete',
      onClick: () => {
        setIsDeleteOpen(true);
        setCurrentApp(app!);
      },
      visible: true,
      disabled: isShared || id === '' || !isAppCard, // Disable delete for shared apps
      danger: true,
    },
  ];
  
  
  
  const getHoverClass = (id: string) => {
    const element = document.querySelector(
      `#card-content-container-${id}`,
    ) as HTMLElement;
    if (!element) {
      return;
    }

    const description = element.querySelector('.card-description');
    if (description) {
      const contentLength = description.textContent?.length || 0;
      if (contentLength > 170) {
        return 'card-content-container-hover-5';
      } else if (contentLength > 125) {
        return 'card-content-container-hover-4';
      } else if (contentLength > 90) {
        return 'card-content-container-hover-3';
      } else if (contentLength > 45) {
        return 'card-content-container-hover-2';
      } else {
        return 'card-content-container-hover-1';
      }
    }
  };

  const getProfileData = (profile: string) => {
    return currentProfiles.find((p) => p.slug === profile)?.display_name || '';
  };

  return (
    <Box
      className={`card ${isAppCard ? '' : 'service'}`}
      id={`card-${id}`}
      tabIndex={0}
    >
      <Link
        href={url}
        onClick={(e) => {
          if (app && serverStatus === 'Ready') {
            e.preventDefault();
            setCurrentApp({
              id,
              name: title,
              framework: app?.framework || '',
              url: app?.url || '',
              ready: app?.ready || false,
              public: app?.public || false,
              shared: app?.shared || isShared || false,
              last_activity: new Date(app?.last_activity || ''),
              status: 'Ready',
            });
            setIsStartNotRunningOpen(true);
          }
        }}
      >
        <Card id={`card-${id}`} tabIndex={0} className="Mui-card">
          <div
            className={`card-content-header ${isAppCard ? '' : 'card-content-header-service'}`}
          >
            {framework ? (
              <>
                <div className="chip-container">
                  <div className="menu-chip">
                    <StatusChip
                      status={appStatus}
                      additionalInfo={getProfileData(app?.profile || '')}
                      app={app}
                    />
                  </div>
                </div>
                <ContextMenu
                  id={`card-menu-${id}`}
                  lastModified={lastModified}
                  items={menuItems}
                />
              </>
            ) : (
              <></>
            )}
            <CardMedia>
              <div
                className={
                  isAppCard && thumbnail ? 'img-overlay' : 'img-overlay-service'
                }
              >
                {thumbnail && <img src={thumbnail} alt="App thumb" />}
              </div>
            </CardMedia>
          </div>
          <div className="card-content-content">
            {isAppCard ? (
              <div
                id={`card-content-container-${id}`}
                className={`card-content-container ${getHoverClass(id)}`}
              >
                <CardContent className="card-inner-content">
                  {framework ? (
                    <div className="chip-container">
                      <div className="menu-chip">
                        <Chip
                          color="default"
                          variant="outlined"
                          label={framework}
                          id={`chip-${id}`}
                          size="small"
                          sx={{ mb: '8px', fontWeight: 600 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div>
                    <span className="inline relative iconic">{getIcon()}</span>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="div"
                      className="card-title"
                      sx={{ position: 'relative', top: '5px' }}
                    >
                      <Tooltip title={title} placement="top-start">
                        <span
                          className="card-content-truncate"
                          style={{
                            maxWidth: '220px',
                          }}
                        >
                          {title}
                        </span>
                      </Tooltip>
                    </Typography>
                  </div>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="card-description"
                    sx={{
                      fontSize: '12px',
                      mt: '8px',
                    }}
                  >
                    {description}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    className="card-author"
                    sx={{ mt: '6px' }}
                  >
                    <span
                      className="card-content-truncate"
                      style={{
                        maxWidth: '220px',
                        fontSize: '12px',
                      }}
                    >
                      {username}
                    </span>
                  </Typography>
                </CardContent>
              </div>
            ) : (
              <Box className="card-content-container app-service no-hover">
                <CardContent className="card-inner-content">
                  <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    className="card-title"
                    sx={{ position: 'relative', bottom: '3px' }}
                  >
                    {title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    className="card-description-service"
                    sx={{ fontSize: '12px', mt: '8px' }}
                  >
                    {description}
                  </Typography>
                </CardContent>
              </Box>
            )}
          </div>
        </Card>
      </Link>
    </Box>
  );
};

export default AppCard;
