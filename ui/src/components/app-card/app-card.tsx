import { StatusChip } from '@src/components';
import { Badge } from '@src/components/ui/badge';
import { Card } from '@src/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@src/components/ui/tooltip';
import type { AppProfileProps } from '@src/types/api';
import type { JhApp } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import { API_BASE_URL } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Globe, Lock, Pin, Users } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
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
import ContextMenu, {
  type ContextMenuItem,
} from '../context-menu/context-menu';
import './app-card.css';

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
        <Pin
          className="relative -bottom-0.5 h-[18px] w-[18px]"
          data-testid="app-card-icon-service"
        />
      );
    if (isPublic)
      return (
        <Globe
          className="h-[18px] w-[18px]"
          data-testid="app-card-icon-public"
        />
      );
    if (isShared)
      return (
        <Users
          className="h-[18px] w-[18px]"
          data-testid="app-card-icon-shared"
        />
      );
    return (
      <Lock className="h-[18px] w-[18px]" data-testid="app-card-icon-private" />
    );
  };

  const menuItems: ContextMenuItem[] = [
    {
      id: 'start',
      title: 'Start',
      onClick: async () => {
        if (isShared && !currentUserData?.admin) {
          setNotification(
            "You don't have permission to start this app. Please ask the owner to start it.",
          );
          return;
        }
        setIsStartOpen(true);
        setCurrentApp(app!);
      },
      visible: true,
      disabled: serverStatus !== 'Ready',
    },
    {
      id: 'stop',
      title: 'Stop',
      onClick: async () => {
        if (isShared && !currentUserData?.admin) {
          setNotification(
            "You don't have permission to stop this app. Please ask the owner to stop it.",
          );
          return;
        }
        setIsStopOpen(true);
        setCurrentApp(app!);
      },
      visible: true,
      disabled: serverStatus !== 'Running',
    },
    {
      id: 'edit',
      title: 'Edit',
      onClick: () => {
        window.location.href = `${API_BASE_URL}/edit-app?id=${id}`;
      },
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
      disabled: isShared || id === '' || !isAppCard,
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
    <div
      className={`card ${isAppCard ? '' : 'service'}`}
      id={`card-${id}`}
      tabIndex={0}
    >
      <a
        href={url}
        className="block h-full no-underline"
        onClick={(e) => {
          if (serverStatus === 'Running') {
            window.location.href = url;
          } else if (app && serverStatus === 'Ready') {
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
              full_name: app?.full_name || '',
            });
            setIsStartNotRunningOpen(true);
          }
        }}
      >
        <Card
          id={`card-${id}`}
          tabIndex={0}
          className="relative h-full rounded border-0 shadow-md overflow-hidden"
        >
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
            <div>
              <div
                className={
                  isAppCard && thumbnail ? 'img-overlay' : 'img-overlay-service'
                }
              >
                {thumbnail ? (
                  <img src={thumbnail} alt={`${title} logo`} />
                ) : (
                  <span style={{ fontWeight: 'bold' }}>{title}</span>
                )}
              </div>
            </div>
          </div>
          <div className="card-content-content">
            {isAppCard ? (
              <div
                id={`card-content-container-${id}`}
                className={`card-content-container ${getHoverClass(id)}`}
              >
                <div className="card-inner-content px-4 pb-6">
                  {framework ? (
                    <div className="chip-container">
                      <div className="menu-chip">
                        <Badge
                          variant="outline"
                          id={`chip-${id}`}
                          className="mb-2 font-semibold"
                        >
                          {framework}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <></>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="iconic flex-shrink-0">{getIcon()}</span>
                    <div className="card-title text-xl font-bold leading-tight">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className="card-content-truncate"
                              style={{ maxWidth: '220px' }}
                            >
                              {title}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="start">
                            {title}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  <div className="card-description mt-2 text-xs text-muted-foreground">
                    {description}
                  </div>
                  <div className="card-author mt-1.5">
                    <span
                      className="card-content-truncate text-xs"
                      style={{ maxWidth: '220px' }}
                    >
                      {app?.full_name?.split('/')[0] || ''}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-content-container app-service no-hover">
                <div className="card-inner-content px-4 pb-6">
                  <div className="card-title relative -top-[3px] mb-2 text-xl font-bold">
                    {title}
                  </div>
                  <div className="card-description-service mt-2 text-xs text-muted-foreground">
                    {description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </a>
    </div>
  );
};

export default AppCard;
