import { Button } from '@src/components';
import { JhData, JhService } from '@src/types/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentJhData } from 'src/store';

export const ServicesGrid = (): React.ReactElement => {
  const [jHData] = useRecoilState<JhData>(currentJhData);
  const [services, setServices] = useState<JhService[]>([]);

  const { isLoading, error, data } = useQuery<JhService[], { message: string }>(
    {
      queryKey: ['service-data'],
      queryFn: () =>
        // TODO: Replace with default axios instance when API is available
        axios
          .get(`/hub/assets/services.json`)
          .then((response) => {
            return response.data;
          })
          .then((data) => {
            return data;
          }),
      enabled: !!jHData.user,
    },
  );

  const handleButtonClick = (url: string, isExternal: boolean): void => {
    if (isExternal) {
      window.open(url, '_blank');
    } else {
      window.location.assign(url);
    }
  };

  useEffect(() => {
    if (!isLoading && data) {
      setServices(data);
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (error) {
      console.log(error);
    }
  }, [error]);

  return (
    <>
      <div className="container grid grid-cols-12 flex flex-align-center pb-12">
        <div className="col-span-1">
          <h4 className="whitespace-nowrap font-bold">Services</h4>
        </div>
        <div className="col-span-10">
          <hr className="spacer"></hr>
        </div>
        <div className="col-span-1 flex justify-end">
          <h4 className="whitespace-nowrap font-bold">
            {services.length} services
          </h4>
        </div>
      </div>
      <div className="container grid pb-12">
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
      </div>
    </>
  );
};
