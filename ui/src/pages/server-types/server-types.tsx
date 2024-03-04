import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { AppProfileProps } from '@src/types/api';
import axios from '@src/utils/axios';
import { API_BASE_URL, APP_BASE_URL } from '@src/utils/constants';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { useSearchParams } from 'react-router-dom';

export const ServerTypes = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const [selectedServerType, setSelectedServerType] =
    React.useState<string>('');

  const id = searchParams.get('id');

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
  };

  return (
    <div className="container">
      <div className="row breadcrumb">
        <Button
          id="back-btn"
          type="button"
          variant="text"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() =>
            (document.location.href = `${API_BASE_URL}/create-app`)
          }
        >
          Back
        </Button>
      </div>
      <div className="row">
        <h1>Server Type</h1>
        <p className="paragraph">
          Please select the appropriate server for your app. For more
          information on server types,{' '}
          <span>
            <a
              href="https://www.nebari.dev/docs/welcome"
              target="_blank"
              rel="noopener noreferrer"
              className="paragraph-link"
            >
              visit our docs
            </a>
          </span>
          .
        </p>
      </div>
      {error ? (
        <div>An error occurred: {(error as Error).message}</div>
      ) : isLoading ? (
        <div className="font-bold center">Loading...</div>
      ) : serverTypes && serverTypes.length > 0 ? (
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-section">
            {serverTypes?.map((type: AppProfileProps) => (
              <RadioGroup>
                <Card className="server-type-card">
                  <CardContent>
                    <FormControlLabel
                      value={type.slug}
                      key={type.slug}
                      id={type.slug}
                      control={
                        <Radio
                          checked={selectedServerType === type.slug}
                          onChange={handleRadioChange}
                        />
                      }
                      label={type.display_name}
                    />
                    <p>{type.description}</p>
                  </CardContent>
                </Card>
              </RadioGroup>
            ))}
          </div>
          <hr />
          <div className="button-section">
            <div className="prev">
              <Button
                id="cancel-btn"
                type="button"
                variant="text"
                color="secondary"
                onClick={() => (document.location.href = `${APP_BASE_URL}`)}
              >
                Cancel
              </Button>
            </div>
            <div className="next">
              <Button
                id="submit-btn"
                type="submit"
                variant="contained"
                color="primary"
              >
                {id ? <>Update App</> : <>Create App</>}
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div>No servers available</div>
      )}
    </div>
  );
};
