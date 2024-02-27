import { AppProfileProps } from '@src/types/api';
import axios from '@src/utils/axios';
import React, { useEffect, useState } from 'react';
import RadioButton from '../../components/radio-button/radio-button';

export const ServerTypes = (): React.ReactElement => {
  const [selectedServerType, setSelectedServerType] = useState<string>('');
  const [serverTypes, setServerTypes] = useState<AppProfileProps[]>([]);

  useEffect(() => {
    axios
      .get('/spawner-profiles/')
      .then((response) => {
        console.log('Full response:', response);
        return setServerTypes(response.data);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);

  useEffect(() => {
    console.log('serverTypes', serverTypes);
  }, [serverTypes]);

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedServerType(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Submit the form data, for example, to an API
    console.log('Selected server type:', selectedServerType);
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto px-4">
      <div className="container mx-auto px-4 server-types">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-start-4 col-span-6 bg-gray-200 p-4">
            <h1 className="mb-0">Server Type</h1>
            <p>
              Please select the appropriate server for you app. For more
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
              {serverTypes.map((type) => (
                <RadioButton
                  key={type.slug} // Add this line
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
                  <button
                    className="btn btn-primary br-5"
                    onClick={
                      handleSubmit as unknown as React.MouseEventHandler<HTMLButtonElement>
                    }
                  >
                    Create App
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
