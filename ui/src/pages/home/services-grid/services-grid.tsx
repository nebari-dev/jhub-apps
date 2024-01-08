import { Button } from '@src/components';
import { JhData, JhService, JhServiceFull } from '@src/types/jupyterhub';
import axios from '@src/utils/axios';
import { getServices } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentJhData, currentNotification } from '../../../store';

export const ServicesGrid = (): React.ReactElement => {
  const [jHData] = useRecoilState<JhData>(currentJhData);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [services, setServices] = useState<JhService[]>([]);

  const { isLoading, error, data } = useQuery<
    JhServiceFull[],
    { message: string }
  >({
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
    enabled: !!jHData.user,
  });

  const handleButtonClick = (url: string, isExternal: boolean): void => {
    if (isExternal) {
      window.open(url, '_blank');
    } else {
      window.location.assign(url);
    }
  };

  useEffect(() => {
    if (!isLoading && data) {
      setServices(() => getServices(data, jHData.user));
    }
  }, [isLoading, data, jHData.user]);

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <>
      <div className="container flex flex-align-center pb-12">
        <div className="grid-heading-left w-full">
          <h2 className="whitespace-nowrap font-bold">Services</h2>
        </div>
        <div className="grid-heading-center w-full">
          <hr className="grid-spacer"></hr>
        </div>
        <div className="grid-heading-right w-full flex justify-end">
          <h2 className="whitespace-nowrap font-bold">
            {services.length} services
          </h2>
        </div>
      </div>
      <div className="container grid pb-12">
        {services.length > 0 ? (
          <div className="flex flex flex-row flex-wrap gap-4">
            {services.map((service, index) => (
              <Button
                id={`service-${index}`}
                key={`service-${index}`}
                variant="secondary"
                style={{ minWidth: '180px' }}
                onClick={() => {
                  handleButtonClick(service.url, service.external);
                }}
              >
                {service.name}
              </Button>
            ))}
          </div>
        ) : (
          <div>No services available</div>
        )}
      </div>
    </>
  );
};
