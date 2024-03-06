import { Box, Button, Stack } from '@mui/material';
import { JhData, JhService, JhServiceFull } from '@src/types/jupyterhub';
import axios from '@src/utils/axios';
import { getServices } from '@src/utils/jupyterhub';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { Item } from 'src/styles/styled-item';
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
              <h2>Services</h2>
            </div>
            <div className="grid-heading-center">
              <hr className="grid-spacer"></hr>
            </div>
            <div className="grid-heading-right">
              <h2>{services.length} services</h2>
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
            ) : services.length > 0 ? (
              // Wrap the code block inside curly braces and return the JSX elements explicitly
              <>
                {services.map((service, index) => {
                  return (
                    <Button
                      id={`service-${index}`}
                      key={`service-${index}`}
                      variant="outlined"
                      color="secondary"
                      style={{ minWidth: '180px' }}
                      onClick={() => {
                        handleButtonClick(service.url, service.external);
                      }}
                    >
                      {service.name}
                    </Button>
                  );
                })}
              </>
            ) : (
              <div>No services available</div>
            )}
          </Box>
        </Item>
      </Stack>
    </Box>
  );
};
