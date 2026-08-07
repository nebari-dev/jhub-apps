import { Button } from '@src/components/ui/button';
import { InputWithIcon } from '@src/components/ui/input-with-icon';
import { Separator } from '@src/components/ui/separator';
import type { ServersData } from '@src/types/api';
import type { JhApp } from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { API_BASE_URL } from '@src/utils/constants';
import { filterAndSortApps } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import type React from 'react';
import { type SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentSearchValue,
  currentFrameworks as defaultFrameworks,
  currentGroups as defaultGroups,
  currentOwnershipValue as defaultOwnershipValue,
  currentServerStatuses as defaultServerStatuses,
  currentSortValue as defaultSortValue,
  currentUser as defaultUser,
} from '../../../store';
import { AppFilters } from './app-filters/app-filters';
import { AppGrid } from './app-grid/app-grid';
import { AppTable } from './app-table/app-table';

export const AppsSection = (): React.ReactElement => {
  const [apps, setApps] = useState<JhApp[]>([]);
  const [, setAppStatus] = useState('');
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [isGridViewActive, setIsGridViewActive] = useState<boolean>(true);
  const [searchValue, setCurrentSearchValue] =
    useRecoilState<string>(currentSearchValue);
  const [currentFrameworks] = useRecoilState<string[]>(defaultFrameworks);
  const [currentGroups] = useRecoilState<string[]>(defaultGroups);
  const [currentOwnershipValue] = useRecoilState<string>(defaultOwnershipValue);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentSortValue] = useRecoilState<string>(defaultSortValue);
  const [currentServerStatuses] = useRecoilState<string[]>(
    defaultServerStatuses,
  );
  const toggleView = () => setIsGridViewActive((prev) => !prev);

  // Held in a ref so that refreshing the server data re-applies whatever the
  // user has already applied, without the filter state itself re-triggering
  // the effect below (filters are applied on demand, not on every change).
  const appliedFilters = useRef({
    searchValue,
    currentOwnershipValue,
    currentFrameworks,
    currentSortValue,
    currentServerStatuses,
    currentGroups,
  });
  appliedFilters.current = {
    searchValue,
    currentOwnershipValue,
    currentFrameworks,
    currentSortValue,
    currentServerStatuses,
    currentGroups,
  };

  const {
    isLoading,
    error,
    data: serverData,
  } = useQuery<ServersData, { message: string }>({
    queryKey: ['app-state'],
    queryFn: () =>
      axios
        .get('/server/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const handleSearch = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setCurrentSearchValue(target.value);
    if (serverData && currentUser) {
      setApps(
        filterAndSortApps(
          serverData,
          currentUser,
          target.value,
          currentOwnershipValue,
          currentFrameworks,
          currentSortValue,
          currentServerStatuses,
          currentGroups,
        ),
      );
    }
  };

  useEffect(() => {
    const serverStatus = apps.map((app) => app.status);
    if (serverStatus) {
      setAppStatus(serverStatus.join(', '));
    }
  }, [apps, setNotification, setAppStatus]);

  useEffect(() => {
    if (!isLoading && serverData) {
      setApps(
        filterAndSortApps(
          serverData,
          currentUser,
          appliedFilters.current.searchValue,
          appliedFilters.current.currentOwnershipValue,
          appliedFilters.current.currentFrameworks,
          appliedFilters.current.currentSortValue,
          appliedFilters.current.currentServerStatuses,
          appliedFilters.current.currentGroups,
        ),
      );
    }
  }, [isLoading, serverData, currentUser]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <section>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="flex-1 text-xl font-bold">App Library</h2>
          <div className="flex items-center gap-4">
            <InputWithIcon
              id="search"
              placeholder="Search Apps..."
              aria-label="Search for an app"
              onChange={handleSearch}
              startIcon={<Search className="h-4 w-4" />}
              containerClassName="w-[200px] md:w-[300px] lg:w-[600px]"
              className="bg-background"
            />
            <Button
              id="create-app"
              variant="default"
              size="lg"
              onClick={() => {
                window.location.href = `${API_BASE_URL}/create-app`;
              }}
            >
              <Plus className="h-4 w-4" />
              Deploy App
            </Button>
          </div>
        </div>
        <div className="pt-4 pb-6">
          <Separator />
        </div>
        {serverData && currentUser ? (
          <AppFilters
            data={serverData}
            currentUser={currentUser}
            setApps={setApps}
            isGridViewActive={isGridViewActive}
            toggleView={toggleView}
          />
        ) : null}
        <div className="flex flex-row flex-wrap items-start gap-4 pb-12">
          {isLoading ? (
            <div className="font-bold">Loading...</div>
          ) : apps.length > 0 ? (
            isGridViewActive ? (
              <AppGrid apps={apps} />
            ) : (
              <AppTable apps={apps} />
            )
          ) : (
            <div>No apps available</div>
          )}
        </div>
      </div>
    </section>
  );
};
