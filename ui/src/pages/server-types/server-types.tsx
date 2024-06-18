import ArrowBackIcon from '@mui/icons-material/ArrowBackRounded';
import { LoadingButton } from '@mui/lab';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
} from '@mui/material';
import { AppProfileProps, AppQueryUpdateProps } from '@src/types/api';
import { AppFormInput } from '@src/types/form';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getFriendlyEnvironmentVariables,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { StyledFormHeading } from 'src/styles/styled-form-heading';
import { StyledFormParagraph } from 'src/styles/styled-form-paragraph';
import { StyledFormSection } from 'src/styles/styled-form-section';
import { Item } from 'src/styles/styled-item';
import {
  currentNotification,
  currentFile as defaultFile,
  currentFormInput as defaultFormInput,
  currentImage as defaultImage,
  currentServerName as defaultServerName,
  currentUser as defaultUser,
} from '../../store';
import './server-types.css';

export const ServerTypes = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [, setCurrentNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentFormInput, setCurrentFormInput] = useRecoilState<
    AppFormInput | undefined
  >(defaultFormInput);
  const [currentServerName] = useRecoilState<string | undefined>(
    defaultServerName,
  );
  const [currentFile] = useRecoilState<File | undefined>(defaultFile);
  const [currentImage] = useRecoilState<string | undefined>(defaultImage);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [selectedServerType, setSelectedServerType] = React.useState<string>(
    currentFormInput?.profile || '',
  );
  const id = searchParams.get('id');

  // Use `useQuery` with an inline async function for the Axios call
  const {
    data: serverTypes,
    isLoading,
    error,
  } = useQuery<AppProfileProps[], { message: string }>({
    queryKey: ['server-types'],
    queryFn: () =>
      axios
        .get('/spawner-profiles/')
        .then((response) => {
          return response.data;
        })
        .then((data) => {
          return data;
        }),
    enabled: !!currentUser,
  });

  const handleCardClick = (slug: string) => {
    setSelectedServerType(slug);
    if (currentFormInput) {
      setCurrentFormInput({
        ...currentFormInput,
        profile: slug,
      });
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const displayName = currentFormInput?.display_name || '';
    const payload = {
      servername: currentServerName || displayName,
      user_options: {
        jhub_app: true,
        display_name: currentFormInput?.display_name || '',
        description: currentFormInput?.description || '',
        framework: currentFormInput?.framework || '',
        thumbnail: currentFormInput?.thumbnail || '',
        filepath: currentFormInput?.filepath || '',
        conda_env: currentFormInput?.conda_env || '',
        env: getFriendlyEnvironmentVariables(currentFormInput?.env),
        custom_command: currentFormInput?.custom_command || '',
        profile: currentFormInput?.profile || '',
        public: currentFormInput?.is_public || false,
        share_with: {
          users: currentFormInput?.share_with?.users || [],
          groups: currentFormInput?.share_with?.groups || [],
        },
        keep_alive: currentFormInput?.keep_alive || false,
      },
    };
    setSubmitting(true);
    if (id) {
      updateQuery(payload, {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          window.location.assign(APP_BASE_URL);
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: async (error: any) => {
          setSubmitting(false);
          setNotification(error.message);
        },
      });
    } else {
      createQuery(payload, {
        onSuccess: async (data) => {
          const username = currentUser?.name;
          if (username && data?.length > 1) {
            const server = data[1];
            window.location.assign(`/hub/spawn-pending/${username}/${server}`);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: async (error: any) => {
          setSubmitting(false);
          setNotification(error.message);
        },
      });
    }
  };

  const createRequest = async ({
    servername,
    user_options,
  }: AppQueryUpdateProps) => {
    const headers = {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    };
    const formData = new FormData();
    formData.append('data', JSON.stringify({ servername, user_options }));
    if (currentFile) {
      formData.append('thumbnail', currentFile as Blob);
    }

    const response = await axios.post('/server', formData, { headers });
    return response.data;
  };

  const updateRequest = async ({
    servername,
    user_options,
  }: AppQueryUpdateProps) => {
    const headers = {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    };
    const formData = new FormData();
    formData.append('data', JSON.stringify({ servername, user_options }));
    if (currentFile) {
      formData.append('thumbnail', currentFile as Blob);
    } else if (currentImage) {
      formData.append('thumbnail_data_url', currentImage);
    }

    const response = await axios.put(`/server/${servername}`, formData, {
      headers,
    });
    return response.data;
  };

  const { mutate: createQuery } = useMutation({
    mutationFn: createRequest,
    retry: 1,
  });

  const { mutate: updateQuery } = useMutation({
    mutationFn: updateRequest,
    retry: 1,
  });

  useEffect(() => {
    if (error) {
      setCurrentNotification(error.message);
    } else {
      setCurrentNotification(undefined);
    }
  }, [error, setCurrentNotification]);

  return (
    <Box className="container">
      <Stack>
        <Item>
          <div className="form-breadcrumb">
            <Button
              id="back-btn"
              type="button"
              variant="text"
              color="primary"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigateToUrl(APP_BASE_URL)}
            >
              Back To Home
            </Button>
          </div>
        </Item>
        <Item>
          <StyledFormHeading>Server Type</StyledFormHeading>
          <StyledFormParagraph>
            Please select the appropriate server for your app. For more
            information on server types,{' '}
            <span>
              <a
                href="https://www.nebari.dev/docs/welcome"
                target="_blank"
                rel="noopener noreferrer"
                className="form-paragraph-link"
              >
                visit our docs
              </a>
            </span>
            .
          </StyledFormParagraph>
        </Item>
        <Item>
          {isLoading ? (
            <div className="font-bold center">Loading...</div>
          ) : serverTypes && serverTypes.length > 0 ? (
            <form className="form" onSubmit={handleSubmit}>
              <StyledFormSection sx={{ pb: '36px' }}>
                <RadioGroup>
                  {serverTypes?.map((type: AppProfileProps, index: number) => (
                    <Card
                      key={`server-type-card-${type.slug}`}
                      className="server-type-card"
                      onClick={() => handleCardClick(type.slug)}
                      tabIndex={0}
                    >
                      <CardContent>
                        <FormControlLabel
                          value={type.slug}
                          key={type.slug}
                          id={type.slug}
                          control={
                            <Radio
                              checked={
                                selectedServerType
                                  ? selectedServerType === type.slug
                                  : index === 0
                              }
                            />
                          }
                          label={type.display_name}
                        />
                        <p>{type.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </RadioGroup>
              </StyledFormSection>
              <hr />
              <div className="button-section">
                <div className="prev">
                  <Button
                    id="cancel-btn"
                    type="button"
                    variant="text"
                    color="primary"
                    onClick={() =>
                      navigate(id ? `/edit-app?id=${id}` : '/create-app')
                    }
                  >
                    Back
                  </Button>
                </div>
                <div className="next">
                  <LoadingButton
                    id="submit-btn"
                    type="submit"
                    variant="contained"
                    color="primary"
                    loading={submitting}
                  >
                    {id ? 'Save' : 'Create App'}
                  </LoadingButton>
                </div>
              </div>
            </form>
          ) : (
            <div>No servers available</div>
          )}
        </Item>
      </Stack>
    </Box>
  );
};
