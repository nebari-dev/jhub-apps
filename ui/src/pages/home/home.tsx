import { Alert, Button, Modal, TextInput } from '@src/components';
import React, { SyntheticEvent, useState } from 'react';
import { useRecoilState } from 'recoil';
import { currentNotification } from '../../store';
import AppForm from './app-form/app-form';
import { AppsGrid } from './apps-grid/apps-grid';
import { ServicesGrid } from './services-grid/services-grid';

export const Home = (): React.ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification] = useRecoilState<string | undefined>(
    currentNotification,
  );

  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (event: SyntheticEvent) => {
    const target = event.target as HTMLInputElement;
    setSearchValue(target.value);
  };

  return (
    <>
      <div className="container grid grid-cols-12 pb-12">
        <div className="md:col-span-2 xs:col-span-12">
          <h1 className="text-3xl font-bold">Home</h1>
        </div>
        <div className="md:col-span-8 xs:col-span-8">
          <TextInput
            id="search"
            placeholder="Search..."
            aria-label="Search for an app"
            className="w-full mt-0"
            onChange={handleSearch}
          />
        </div>
        <div className="md:col-span-2 xs:col-span-4 flex justify-end">
          <Button
            id="create-app"
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Create App
          </Button>
          {isOpen && (
            <Modal
              title="Create New App"
              setIsOpen={setIsOpen}
              body={<AppForm onCancel={() => setIsOpen(false)} />}
            />
          )}
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
      <AppsGrid appType="My" filter={searchValue} />
      <AppsGrid appType="Shared" filter={searchValue} />
    </>
  );
};
