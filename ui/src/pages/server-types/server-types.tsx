import { AppProfileProps } from '@src/types/api';
import axios from '@src/utils/axios';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import RadioButton from '../../components/radio-button/radio-button';
export const ServerTypes = (): React.ReactElement => {
  const [selectedServerType, setSelectedServerType] =
    React.useState<string>('');

  // Use `useQuery` with an inline async function for the Axios call
  const {
    data: serverTypes,
    isLoading,
    error,
  } = useQuery(['serverTypes'], async () => {
    const { data } = await axios.get('/spawner-profiles/');
    return data;
  });

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedServerType(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Selected server type:', selectedServerType);
  };

  return (
    <div className="server-types">
      {error ? (
        <div>An error occurred: {(error as Error).message}</div>
      ) : isLoading ? (
        <div className="font-bold center">Loading...</div>
      ) : serverTypes.length > 0 ? (
        <form onSubmit={handleSubmit} className="container mx-auto px-4">
          <div className="container mx-auto px-4 server-types">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-start-4 col-span-6 bg-gray-200 p-4">
                <h1 className="mb-0">Server Type</h1>
                <h2>Length: {serverTypes.length}</h2>
                <p>
                  Please select the appropriate server for your app. For more
                  information on server types,{' '}
                  <span>
                    <a
                      href="https://www.nebari.dev/docs/welcome"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      visit our docs
                    </a>
                  </span>
                  .
                </p>
                <div className="container my-2">
                  {serverTypes?.map((type: AppProfileProps) => (
                    <RadioButton
                      key={type.slug}
                      id={type.slug}
                      name={type.display_name}
                      label={type.display_name}
                      subtext={type.description}
                      value={type.slug}
                      checked={selectedServerType === type.slug}
                      onChange={handleRadioChange}
                    />
                  ))}
                  <div className="button-container bt">
                    <button className="btn">Cancel</button>
                    <div className="button-group">
                      <button className="btn btn-primary br-5 mr-1" disabled>
                        Back
                      </button>
                      <button type="submit" className="btn btn-primary br-5">
                        Create App
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div>No servers available</div>
      )}
    </div>
  );
};
