import { Alert, Button, TextInput } from '@src/components';
import React from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification } from 'src/store';
import { AppsGrid } from './apps-grid/apps-grid';
import { ServicesGrid } from './services-grid/services-grid';

export const Home = (): React.ReactElement => {
  const [notification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  return (
    <>
      <div className="container grid grid-cols-12 pb-12">
        <div className="col-span-2">
          <h1 className="text-3xl font-bold">Home</h1>
        </div>
        <div className="col-span-8">
          <TextInput
            id="search"
            placeholder="Search..."
            aria-label="Search for an app"
            className="w-full mt-0"
          />
        </div>
        <div className="col-span-2 flex justify-end">
          <Button
            id="create-app"
            onClick={() => {
              window.location.assign('/services/japps/create-app');
            }}
          >
            Create App
          </Button>
        </div>
      </div>
      {notification && (
        <div className="container grid grid-cols-12 pb-2">
          <div className="col-span-12">
            <Alert id="alert-notification" type="error">
              {notification}
            </Alert>
          </div>
        </div>
      )}
      <ServicesGrid />
      <AppsGrid appType="My" />
      <AppsGrid appType="Shared" />
    </>
  );
};
