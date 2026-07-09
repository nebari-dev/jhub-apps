import { Separator } from '@src/components/ui/separator';
import type {
  JhApp,
  JhServerData,
  JhServiceApp,
  JhServiceFull,
} from '@src/types/jupyterhub';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { getPinnedApps, getPinnedServices } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentUser as defaultUser,
} from '../../../store';
import { ServiceGrid } from './service-grid/service-grid';

export const ServicesSection = (): React.ReactElement => {
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [services, setServices] = useState<JhServiceApp[]>([]);
  const [apps, setApps] = useState<JhApp[]>([]);

  const {
    isLoading: servicesLoading,
    error: servicesError,
    data: servicesData,
  } = useQuery<JhServiceFull[], { message: string }>({
    queryKey: ['service-data'],
    queryFn: () =>
      axios
        .get('/services/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const {
    isLoading: appsLoading,
    error: appsError,
    data: appsData,
  } = useQuery<JhServerData, { message: string }>({
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

  useEffect(() => {
    if (!servicesLoading && servicesData && currentUser) {
      setServices(() => getPinnedServices(servicesData, currentUser.name));
    }
  }, [servicesLoading, servicesData, currentUser]);

  useEffect(() => {
    if (!appsLoading && appsData && currentUser) {
      setApps(() => getPinnedApps(appsData, currentUser.name));
    }
  }, [appsLoading, appsData, currentUser]);

  useEffect(() => {
    if (servicesError) {
      setCurrentNotification(servicesError.message);
    } else if (appsError) {
      setCurrentNotification(appsError.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [servicesError, appsError, setCurrentNotification]);

  return (
    <section>
      <div className="flex flex-col">
        <h2 className="text-xl font-bold">Quick Access</h2>
        <div className="pt-4 pb-6">
          <Separator />
        </div>
        <div className="flex flex-row flex-wrap items-start gap-4 pb-12">
          {servicesLoading || appsLoading ? (
            <div className="font-bold">Loading...</div>
          ) : services.length > 0 || apps.length > 0 ? (
            <ServiceGrid services={services} apps={apps} />
          ) : (
            <div>No services available</div>
          )}
        </div>
      </div>
    </section>
  );
};
