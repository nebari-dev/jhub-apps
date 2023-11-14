import { Button } from '@src/components';
import { services } from '@src/data/service.ts';
import React from 'react';

export const ServicesGrid = (): React.ReactElement => {
  const handleButtonClick = (url: string, isExternal: boolean): void => {
    if (isExternal) {
      window.open(url, '_blank');
    } else {
      window.location.assign(url);
    }
  };
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
