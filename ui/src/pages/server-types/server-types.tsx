// server-types.tsx
import React, { useState } from 'react';
import RadioButton from '../../components/radio-button/radio-button';

type ServerType = {
  id: string;
  name: string;
  subtext: string;
};

const serverTypes: ServerType[] = [
  {
    id: '1',
    name: 'Small Instance',
    subtext: 'Stable Environment with 2 CPU / 8GB RAM',
  },
  {
    id: '2',
    name: 'Small Instance',
    subtext: 'Stable Environment with 2 CPU / 8GB RAM',
  },
  {
    id: '3',
    name: 'Medium Instance',
    subtext: 'Stable Environment with 4 CPU / 16GB RAM',
  },
  {
    id: '4',
    name: 'Medium Instance',
    subtext: 'Stable Environment with 4 CPU / 16GB RAM',
  },
  {
    id: '5',
    name: 'Large Instance',
    subtext: 'Stable Environment with 6 CPU / 24GB RAM',
  },
  {
    id: '6',
    name: 'Large Instance',
    subtext: 'Stable Environment with 6 CPU / 32GB RAM',
  },
  {
    id: '7',
    name: 'Large Instance',
    subtext: 'Stable Environment with 8 CPU / 40GB RAM',
  },
  {
    id: '8',
    name: 'Large Instance',
    subtext: 'Stable Environment with 8 CPU / 48GB RAM',
  },
  // Add more server types as needed
];

export const ServerTypes = (): React.ReactElement => {
  const [selectedServerType, setSelectedServerType] = useState<string>('');

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
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-start-4 col-span-6 bg-gray-200 p-4">
            <h1 className="mb-0">Hardware Environment</h1>
            <p>
              Select the appropriate profile for your app. For more information
              about selecting profiles, visit our docs
            </p>
            <div className="container my-2">
              {serverTypes.map((type) => (
                <RadioButton
                  key={type.id} // Add this line
                  id={type.id}
                  isTile={false}
                  name={type.name}
                  label={type.name}
                  subtext={type.subtext}
                  value={type.id}
                  checked={selectedServerType === type.id}
                  onChange={handleRadioChange}
                />
              ))}
              <div className="button-container bt">
                <button className="btn">Cancel</button>
                <div className="button-group">
                  <button className="btn btn-primary br-5 mr-1" disabled>
                    Back
                  </button>
                  <button className="btn btn-primary br-5">Create App</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
