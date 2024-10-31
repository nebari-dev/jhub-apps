/* eslint-disable no-console */
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { AxiosError } from 'axios';

import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AppFrameworkProps,
  AppProfileProps,
  AppQueryGetProps,
  AppQueryUpdateProps,
} from '@src/types/api';
import { AppFormInput, AppFormProps, RepoData } from '@src/types/form';
import { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getFriendlyDisplayName,
  getFriendlyEnvironmentVariables,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import { AppSharing, EnvironmentVariables, Thumbnail } from '..';
import {
  currentNotification,
  currentFile as defaultFile,
  currentFormInput as defaultFormInput,
  currentImage as defaultImage,
  isHeadless as defaultIsHeadless,
  currentServerName as defaultServerName,
  currentUser as defaultUser,
} from '../../store';
import { StyledFormSection } from '../../styles/styled-form-section';
import CustomLabel from '../custom-label/custom-label';
import './app-form.css';

export const AppForm = ({
  deployOption,
  id,
  isEditMode,
}: AppFormProps): React.ReactElement => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [currentUser] = useRecoilState<UserState | undefined>(defaultUser);
  const [description, setDescription] = useState<string>('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const firstErrorRef = useRef<HTMLInputElement | null>(null);
  const appInfoRef = useRef<HTMLDivElement | null>(null);
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);

  const [searchParams] = useSearchParams();
  const fullText = 'Validating URL...';
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const initialFilepath = decodeURIComponent(
    searchParams.get('filepath') || '',
  );
  const [gitUrl, setGitUrl] = useState<string>(''); // Store the GitHub URL input
  const [isUrlValid, setIsUrlValid] = useState<boolean>(false); // Track if the URL is valid
  const [isFetching, setIsFetching] = useState<boolean>(false); // For loading state
  const [isProcessing, setIsProcessing] = useState(false);
  const [openModal, setOpenModal] = useState(false); // State to control modal visibility

  const [repoData, setRepoData] = useState<RepoData | null>(null); // Store fetched repo data
  const [isCondaYamlEnabled, setIsCondaYamlEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null); // Store validation errors
  const [shouldValidate, setShouldValidate] = useState(false); // To control validation trigger
  const repoUrlRef = useRef<HTMLInputElement>(null); // Ref for Git Repository URL field
  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty, isValid },
  } = useForm<AppFormInput>({
    defaultValues: {
      display_name: '',
      description: '',
      framework: '',
      thumbnail: '',
      filepath: initialFilepath,
      conda_env: '',
      custom_command: '',
      profile: '',
      is_public: false,
      keep_alive: false,
      share_with: {
        users: [],
        groups: [],
      },
    },
  });

  const initialValues = {
    display_name: '',
    description: '',
    framework: '',
    thumbnail: '',
    filepath: initialFilepath,
    conda_env: '',
    custom_command: '',
    profile: '',
    is_public: false,
    keep_alive: false,
    share_with: {
      users: [],
      groups: [],
    },
  };

  const watchedFields = watch();
  const hasChanges =
    JSON.stringify(watchedFields) !== JSON.stringify(initialValues);

  useEffect(() => {
    // Reset form fields when deployOption changes
    reset({
      display_name: '',
      description: '',
      framework: '',
      thumbnail: '',
      filepath: '',
      conda_env: '',
      custom_command: '',
      profile: '',
      is_public: false,
      keep_alive: false,
    });

    // Reset additional state if necessary
    setDescription('');
    setRepoData(null);
    setIsUrlValid(false);
  }, [deployOption, reset]);

  useEffect(() => {
    const filepathFromQuery = decodeURIComponent(
      searchParams.get('filepath') || '',
    );
    setValue('filepath', filepathFromQuery); // Update the form field value
  }, [searchParams, setValue]);

  const labelStyle = {
    fontSize: '1rem',
    transform: 'translate(14px, -6px) scale(0.75)',
    color: 'rgba(0, 0, 0, 0.87)', // Adjust color based on your needs
    top: '-2px',
    left: '-5px',
    padding: '0 4px',
    zIndex: 1,
    backgroundColor: '#fafbfc', // Set white background
    paddingRight: '4px',
    paddingLeft: '4px',
  };
  // Validate the URL format and fetch repo data
  const validateGitUrl = async () => {
    // Trigger validation after the button is clicked
    setShouldValidate(true);

    const gitRepoUrlPattern =
      /^(https?:\/\/)?[\w.-]+\/[\w-]+\/[\w-]+(\.git)?$/i;

    if (!gitRepoUrlPattern.test(gitUrl)) {
      setError('Invalid Git repository URL');
      setIsUrlValid(false);
      setOpenModal(true);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      const response = await axios.post('/app-config-from-git/', {
        url: gitUrl,
      });

      if (response && response.status === 200) {
        setIsUrlValid(true);
        setRepoData(response.data);
        setIsCondaYamlEnabled(true);
      } else {
        setIsUrlValid(false);
        setError('Repository not found or invalid.');
        setOpenModal(true);
      }
    } catch (err) {
      setIsUrlValid(false);
      setOpenModal(true);

      if (err instanceof AxiosError && err.response) {
        setError(
          `Error: ${err.response.status} - ${err.response.data.message || 'Unknown error'}`,
        );
      } else if (err instanceof AxiosError && err.request) {
        setError('Error: No response from the server.');
      } else if (err instanceof Error) {
        setError(`Error: ${err.message}`);
      } else {
        setError('Unknown error occurred');
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    // When the deployOption changes to "git", focus the Git Repository input
    if (deployOption === 'git' && repoUrlRef.current) {
      repoUrlRef.current.focus();
    }
  }, [deployOption]);

  // Effect to handle enabling/disabling fields based on URL validity
  useEffect(() => {
    if (isUrlValid && repoData) {
      // Prepopulate the form fields with repoData from the backend
      reset({
        display_name: repoData.display_name || '', // Name from the repo
        description: repoData.description || '', // Description from the repo
        framework: repoData.framework || '', // Framework
        filepath: repoData.filepath || '', // File path
        conda_env: repoData.env.conda_env || '', // Conda environment path
        is_public: repoData.public || false, // Is public
        keep_alive: repoData.keep_alive || false, // Keep alive
      });

      // Set environment variables
      setVariables(getFriendlyEnvironmentVariables(repoData.env));
      setDescription(repoData.description || '');
      // Set thumbnail image if available
      setCurrentImage(repoData.thumbnail || '');
    }
  }, [isUrlValid, repoData, reset]);

  const adjustTextareaHeight = (
    textarea: EventTarget & HTMLTextAreaElement,
  ) => {
    if (!textarea) return;
    textarea.style.height = 'auto'; // Reset height to recalculate
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  };

  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [currentFormInput, setCurrentFormInput] = useRecoilState<
    AppFormInput | undefined
  >(defaultFormInput);

  const [currentServerName, setCurrentServerName] = useRecoilState<
    string | undefined
  >(defaultServerName);
  const [currentFile, setCurrentFile] = useRecoilState<File | undefined>(
    defaultFile,
  );
  const [currentImage, setCurrentImage] = useRecoilState<string | undefined>(
    defaultImage,
  );
  const [isPublic, setIsPublic] = useState(false);
  const [currentUserPermissions, setCurrentUserPermissions] = useState<
    string[]
  >([]);
  const [currentGroupPermissions, setCurrentGroupPermissions] = useState<
    string[]
  >([]);
  const [keepAlive, setKeepAlive] = useState(false);
  const [variables, setVariables] = useState<string | null>(null);

  // Get the app data if we're editing an existing app
  const { data: formData, error: formError } = useQuery<
    AppQueryGetProps,
    { message: string }
  >({
    queryKey: ['app-form', id],
    queryFn: () =>
      axios.get(`/server/${id}`).then((response) => {
        return response.data;
      }),
    enabled: !!id,
  });

  const { data: frameworks, isLoading: frameworksLoading } = useQuery<
    AppFrameworkProps[],
    { message: string }
  >({
    queryKey: ['app-frameworks'],
    queryFn: () =>
      axios.get('/frameworks/').then((response) => {
        return response.data;
      }),
  });

  const { data: environments, isLoading: environmentsLoading } = useQuery<
    string[],
    { message: string }
  >({
    queryKey: ['app-environments'],
    queryFn: () =>
      axios.get('/conda-environments/').then((response) => {
        return response.data;
      }),
  });

  const { data: profiles, isLoading: profilesLoading } = useQuery<
    AppProfileProps[],
    { message: string }
  >({
    queryKey: ['app-profiles'],
    queryFn: () =>
      axios.get('/spawner-profiles/').then((response) => {
        return response.data;
      }),
  });

  const currentFramework = watch('framework');

  useEffect(() => {
    const currentTextAreaRef = textAreaRef.current;
    const syncScroll = () => {
      if (overlayRef.current && textAreaRef.current) {
        overlayRef.current.scrollTop = textAreaRef.current.scrollTop;
      }
    };

    currentTextAreaRef?.addEventListener('scroll', syncScroll);
    return () => currentTextAreaRef?.removeEventListener('scroll', syncScroll);
  }, []);

  const checkAppStatus = async (appId: string, username: string) => {
    console.log('CHECKING APP STATUS:', appId, username);
    try {
      // Make the request to check the app status
      const response = await axios.get(`/server-status/${appId}`);

      // Log the response to see what is being returned
      console.log('App status response:', response.data);

      // If the app is running, redirect to the running app
      if (response.data?.status === 'Running') {
        window.location.assign(`${APP_BASE_URL}/user/${username}/${appId}/`);
      } else {
        // If not running yet, poll again after 3 seconds
        setTimeout(() => checkAppStatus(appId, username), 3000);
      }
    } catch (error) {
      console.error('Error checking app status:', error);

      // If there's an error, stop the spinner and show a notification
      setIsProcessing(false); // Stop the spinner
      setNotification('Failed to check app status. Please try again.');
    }
  };

  const getStyledText = () => {
    const normalText = description.slice(0, 200);
    const excessText = description.slice(200);
    return (
      <>
        {normalText}
        <span style={{ color: 'red' }}>{excessText}</span>
      </>
    );
  };

  function handleFocus(focus: boolean): void {
    setIsFocused(focus);
  }

  useEffect(() => {
    // Only start the animation if the URL is still being validated and not yet valid
    if (isFetching && !isUrlValid) {
      const interval = setInterval(() => {
        setDisplayedText(fullText.substring(0, index + 1)); // Slice the text to progressively reveal
        setIndex((prevIndex) => (prevIndex + 1) % fullText.length); // Loop back to 0 when reaching end
      }, 150); // Adjust speed here

      // Clear interval on unmount or `isFetching` change
      return () => clearInterval(interval);
    } else {
      // Reset the animation state when validation is complete
      setDisplayedText('');
      setIndex(0);
    }
  }, [index, isFetching, isUrlValid]);

  const onFormSubmit: SubmitHandler<AppFormInput> = ({
    display_name,
    description,
    framework,
    thumbnail,
    filepath,
    conda_env,
    custom_command,
    profile,
  }) => {
    console.log('Form is being submitted', display_name, description);
    setIsProcessing(true);
    const displayName = getFriendlyDisplayName(display_name);
    if (profiles && profiles.length > 0) {
      const payload: AppFormInput = {
        jhub_app: true,
        display_name: displayName,
        description,
        framework,
        thumbnail,
        filepath,
        conda_env,
        env: getFriendlyEnvironmentVariables(variables),
        custom_command,
        profile,
        is_public: isPublic,
        share_with: {
          users: currentUserPermissions,
          groups: currentGroupPermissions,
        },
        keep_alive: keepAlive,
      };

      // Add repository details only if it's a Git-based app
      if (deployOption === 'git') {
        payload.repository = { url: gitUrl };
      }

      // Check if the app is a Git app
      if (deployOption === 'git') {
        // Use the createOrUpdateAppFromGit function for Git apps
        createOrUpdateAppFromGit(payload);
      } else {
        // Use the createOrUpdateApp function for user-created apps
        createOrUpdateApp(payload);
      }
      // After successful submission, start checking the app status
      checkAppStatus(displayName, currentUser?.name || '');
      setCurrentFormInput(payload);
      navigate(`/server-types${id ? `?id=${id}` : ''}`);
    } else {
      const payload = {
        servername: currentServerName || displayName,
        user_options: {
          jhub_app: true,
          name: currentServerName || displayName,
          display_name: displayName,
          description: description || '',
          framework,
          thumbnail: thumbnail || '',
          filepath: filepath || '',
          conda_env: conda_env || '',
          env: getFriendlyEnvironmentVariables(variables),
          custom_command: custom_command || '',
          profile: profile || '',
          public: isPublic,
          share_with: {
            users: currentUserPermissions,
            groups: currentGroupPermissions,
          },
          keep_alive: keepAlive,
          repository: { url: gitUrl },
        },
      };

      setSubmitting(true);

      if (id) {
        updateQuery(payload, {
          onSuccess: async () => {
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
              window.location.assign(
                `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
              );
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: async (error: any) => {
            setSubmitting(false);
            setNotification(error.message);
          },
        });
      }
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof AxiosError && error.response) {
      // Error from Axios response
      setNotification(
        `Error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`,
      );
    } else if (error instanceof Error) {
      // Generic JavaScript error
      setNotification(`Error: ${error.message}`);
    } else {
      // Unknown error
      setNotification('Unknown error occurred');
    }
  };

  const createOrUpdateAppFromGit = (payload: AppFormInput) => {
    const gitPayload: AppQueryUpdateProps = {
      servername: payload.display_name,
      user_options: {
        jhub_app: true,
        display_name: payload.display_name,
        description: payload.description || '',
        framework: payload.framework,
        thumbnail: payload.thumbnail || '',
        filepath: payload.filepath || '',
        conda_env: payload.conda_env || '',
        env: payload.env,
        custom_command: payload.custom_command || '',
        profile: payload.profile || '',
        public: payload.is_public,
        share_with: {
          users: payload.share_with?.users || [],
          groups: payload.share_with?.groups || [],
        },
        keep_alive: payload.keep_alive,

        repository: {
          url: payload.repository?.url || '',
        },
      },
    };
    setSubmitting(true);
    if (id) {
      console.log('Updating App with ID:', id);
      updateQuery(gitPayload, {
        // onSuccess: async () => {
        //   window.location.assign(APP_BASE_URL);
        // },
        onSuccess: async (data) => {
          console.log('SUCCZESS UPDATEZ', data);
          const username = currentUser?.name;
          const serverId = data[1]; // Assuming the second element is the server ID
          if (username && serverId) {
            checkAppStatus(serverId, username); // Check the app status and redirect when running
            navigate(`${APP_BASE_URL}/apps/${serverId}`); // Navigate to the app's page after success
          }
          setIsProcessing(false);
        },
        onError: async (error: unknown) => {
          console.error('ERROR: Create Query', error);
          setSubmitting(false);
          setIsProcessing(false);
          handleError(error); // Use the new handleError function
        },
      });
    } else {
      createQuery(gitPayload, {
        onSuccess: async (data) => {
          console.log('SUCCZESS', data);
          const username = currentUser?.name;

          // Restore the original logic, checking if username and data are valid
          if (username && data?.length > 1) {
            const server = data[1];

            // Redirect to the spawn-pending page while checking the app status
            window.location.assign(
              `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
            );

            // After redirecting to the pending page, start checking the app status
            checkAppStatus(server, username); // Check the app status and redirect when running
            navigate(`${APP_BASE_URL}/apps/${server}`); // Navigate to the app's page after success
          } else {
            console.error('Username or server data is missing.');
          }
          setIsProcessing(false);
        },
        onError: async (error: unknown) => {
          setSubmitting(false);
          setIsProcessing(false);
          handleError(error);
        },
      });
    }
  };

  const createOrUpdateApp = (formInput: AppFormInput) => {
    setSubmitting(true);

    // Construct the correct payload format for AppQueryUpdateProps
    const payload: AppQueryUpdateProps = {
      servername: formInput.display_name, // Assuming display_name is the servername
      user_options: {
        jhub_app: true,
        display_name: formInput.display_name,
        description: formInput.description || '',
        framework: formInput.framework,
        thumbnail: formInput.thumbnail || '',
        filepath: formInput.filepath || '',
        conda_env: formInput.conda_env || '',
        env: getFriendlyEnvironmentVariables(variables),
        custom_command: formInput.custom_command || '',
        profile: formInput.profile || '',
        public: formInput.is_public,
        share_with: {
          users: currentUserPermissions, // Assuming this comes from the component's state
          groups: currentGroupPermissions, // Assuming this comes from the component's state
        },
        keep_alive: formInput.keep_alive,
      },
    };

    if (id) {
      // If the app already exists (editing an app)
      updateQuery(payload, {
        onSuccess: async () => {
          window.location.assign(APP_BASE_URL);
        },
        onError: async (error: unknown) => {
          setSubmitting(false);
          handleError(error); // Use the new handleError function
        },
      });
    } else {
      // If it's a new app (creating an app)
      createQuery(payload, {
        onSuccess: async (data) => {
          const username = currentUser?.name;
          if (username && data?.length > 1) {
            const server = data[1];
            window.location.assign(
              `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
            );
          }
        },
        onError: async (error: unknown) => {
          setSubmitting(false);
          handleError(error); // Use the new handleError function
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
    if (formError) console.error('Form query error:', formError);
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
    onError: (error) => console.error('Create request error:', error),
  });

  const { mutate: updateQuery } = useMutation({
    mutationFn: updateRequest,
    retry: 1,
  });

  // Populate form with existing app data
  useEffect(() => {
    if (formData?.name && formData?.user_options) {
      setCurrentServerName(formData.name);
      setDescription(formData.user_options.description);
      reset({
        ...formData.user_options,
      });
      setIsPublic(formData.user_options.public);
      setKeepAlive(formData.user_options.keep_alive);
      setVariables(formData.user_options.env || null);
      setCurrentImage(formData.user_options.thumbnail);
      setCurrentUserPermissions(formData.user_options.share_with?.users);
      setCurrentGroupPermissions(formData.user_options.share_with?.groups);
    }
  }, [
    formData,
    formData?.name,
    formData?.user_options,
    reset,
    setCurrentImage,
    setCurrentServerName,
  ]);

  // Populate form when returning from server-types page
  useEffect(() => {
    // istanbul ignore next
    if (currentFormInput) {
      reset({
        display_name: currentFormInput.display_name || '',
        description: currentFormInput.description || '',
        framework: currentFormInput.framework || '',
        filepath: currentFormInput.filepath || '',
        conda_env: currentFormInput.conda_env || '',
        custom_command: currentFormInput.custom_command || '',
        profile: currentFormInput.profile || '',
      });
      setIsPublic(currentFormInput.is_public);
      setKeepAlive(currentFormInput.keep_alive);
      setVariables(currentFormInput.env || null);
      setCurrentImage(currentFormInput.thumbnail);
      setCurrentUserPermissions(currentFormInput.share_with?.users);
      setCurrentGroupPermissions(currentFormInput.share_with?.groups);
    }
  }, [currentFormInput, reset, setCurrentImage, setCurrentServerName]);

  useEffect(() => {
    if (formError) {
      setNotification(formError.message);
    }
  }, [formError, setNotification]);

  const scrollToFirstError = useCallback(() => {
    const scrollToErrorElement = (element: HTMLElement | null) => {
      if (element) {
        const yOffset = 120; // Desired distance from the top of the viewport
        const elementRect = element.getBoundingClientRect();
        const scrollY = window.scrollY || window.scrollY;
        const y = elementRect.top + scrollY - yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => {}, 500); // Adjust timeout duration as needed
      }
    };

    // Delay the scroll action to ensure DOM updates are complete
    setTimeout(() => {
      requestAnimationFrame(() => {
        // Focus on the first input with an error
        if (errors.display_name) {
          scrollToErrorElement(document.getElementById('display_name'));
          setFocus('display_name');
        } else if (errors.framework) {
          scrollToErrorElement(document.getElementById('framework'));
          setFocus('framework');
        } else if (errors.custom_command) {
          scrollToErrorElement(document.getElementById('custom_command'));
          setFocus('custom_command');
        } else if (errors.conda_env) {
          scrollToErrorElement(document.getElementById('conda_env'));
          setFocus('conda_env');
        }
      });
    }, 0);
  }, [errors, setFocus]);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      scrollToFirstError();
    }
  }, [errors, scrollToFirstError]);

  return (
    <>
      <form
        id="app-form"
        onSubmit={(e) => {
          e.preventDefault();

          // Proceed to call handleSubmit
          handleSubmit(onFormSubmit, scrollToFirstError)(e);
        }}
        className="form"
        noValidate
      >
        <StyledFormSection ref={appInfoRef}>
          <Typography component="h2" variant="subtitle1">
            {deployOption === 'git' ? 'App Info (Git Repository)' : 'App Info'}
          </Typography>

          {deployOption === 'git' ? (
            <>
              {/* Git Repository URL Input */}
              <Controller
                name="repository.url"
                control={control}
                render={({ field }) => (
                  <FormControl error={!!error && shouldValidate}>
                    <TextField
                      {...field}
                      inputRef={repoUrlRef}
                      id="repository.url"
                      label="Git Repository URL"
                      placeholder="Enter Git repository URL"
                      required
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)} // Don't validate here, just set the value
                      error={!!error && shouldValidate} // Only show error if shouldValidate is true
                      helperText={
                        !!error && shouldValidate
                          ? error
                          : 'Enter a valid GitHub URL'
                      }
                      disabled={isFetching}
                    />
                  </FormControl>
                )}
              />

              {/* Show loader while fetching */}
              {/* {isFetching && <Typography sx={{ margin: '1.5rem 0' }}>{displayedText}</Typography>} */}
              {isFetching && !isUrlValid && (
                // Set a fixed width to prevent jumping
                <Typography
                  sx={{ mb: '3rem', whiteSpace: 'pre-wrap', color: '#ba18da' }}
                >
                  {displayedText || ' '.repeat(fullText.length)}
                </Typography>
              )}

              {/* Branch Input */}
              <Controller
                name="branch"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <TextField
                      {...field}
                      id="branch"
                      label="Branch"
                      placeholder="e.g., main"
                      defaultValue={formData?.defaultBranch || 'main'} // Prepopulate if data is fetched
                      disabled={!isUrlValid} // Disable field until URL is validated
                    />
                  </FormControl>
                )}
              />

              {/* Conda YAML Directory Input */}
              <Controller
                name="conda_project_yml"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    {/* Label for Conda YAML Directory */}
                    <InputLabel
                      htmlFor="conda_project_yml"
                      shrink
                      sx={labelStyle}
                    >
                      Conda YAML Directory
                    </InputLabel>

                    {/* Conda YAML Directory TextField */}
                    <TextField
                      {...field}
                      id="conda_project_yml"
                      placeholder="Enter path to conda-project.yml"
                      disabled={!isCondaYamlEnabled} // Disable until configuration is fetched
                      value={repoData?.conda_project_yml || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      // InputProps={{
                      //   style: { opacity: isCondaYamlEnabled ? 1 : 0.8 },
                      // }}
                      helperText="Optional: if conda-project.yml is not present in root directory"
                    />
                  </FormControl>
                )}
              />
              <Box mt={0} mb={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={validateGitUrl} // Trigger the URL validation on button click
                  disabled={isFetching} // Disable button while fetching data
                >
                  Fetch App Configuration
                </Button>
              </Box>
              {/* Name Input */}
              <Controller
                name="display_name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl error={!!errors.display_name} fullWidth>
                    <TextField
                      {...field}
                      id="display_name"
                      label="Name"
                      placeholder="Add app name"
                      value={repoData?.display_name || ''}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      error={!!errors.display_name}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={!isUrlValid} // Disable until URL is valid
                    />
                    <FormHelperText>*Required</FormHelperText>
                  </FormControl>
                )}
              />

              {/* Description Input */}
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    className="form-control outer-div"
                    variant="outlined"
                    style={{ position: 'relative' }}
                  >
                    {/* Label for Description */}
                    <label
                      htmlFor="description"
                      className="description-label"
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '10px',
                        transform: 'translate(0, -50%)',
                        color: isFocused ? '#ba18da' : '#646464',
                        backgroundColor: '#fafafa',
                        padding: '0 4px',
                        zIndex: 1,
                      }}
                    >
                      Description
                    </label>

                    {/* Textarea for Description */}
                    <textarea
                      {...field}
                      ref={textAreaRef}
                      id="description"
                      value={description}
                      disabled={!isUrlValid}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        field.onChange(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onFocus={() => handleFocus(true)}
                      onBlur={() => {
                        field.onBlur();
                        handleFocus(false);
                      }}
                      className="description_text-field"
                      placeholder="Add app description (max. 200 characters)"
                      style={{
                        paddingBottom: '8px',
                        borderColor: isFocused ? '#ba18da' : '#ccc',
                        letterSpacing: '.15px',
                        backgroundColor: '#FAFAFA',
                      }}
                    />

                    <div ref={overlayRef} className="overlay-text">
                      {getStyledText()}
                    </div>

                    {/* Helper Text to Display Character Count */}
                    <FormHelperText
                      className="form-helper-text"
                      style={{
                        textAlign: 'right',
                        marginRight: '0',
                        fontSize: '1rem',
                        color: description.length > 200 ? 'red' : 'inherit',
                      }}
                    >
                      {description.length}/200
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </>
          ) : (
            <>
              {/* Display App Info when 'App Launcher' is selected */}
              <Controller
                name="display_name"
                control={control}
                rules={{ required: true }}
                render={({ field: { ref, ...field } }) => (
                  <FormControl error={!!errors.display_name}>
                    {errors.display_name && (
                      <Box
                        display="flex"
                        alignItems="center"
                        color="error.main"
                        mb={2}
                      >
                        <ErrorRoundedIcon fontSize="small" />
                        <Typography variant="body2" color="error" ml={1}>
                          Enter an app name
                        </Typography>
                      </Box>
                    )}
                    <TextField
                      {...field}
                      id="display_name"
                      label={<CustomLabel label="Name" required={true} />}
                      placeholder="Add app name"
                      inputRef={(e) => {
                        ref(e);
                        if (errors.display_name) {
                          firstErrorRef.current = e;
                        }
                      }}
                      autoFocus
                      error={!!errors.display_name}
                      inputProps={{ maxLength: 255 }}
                      helperText={
                        <span
                          style={{
                            fontSize: '12px',
                            color: errors.display_name
                              ? 'error'
                              : 'textSecondary',
                          }}
                        >
                          *Required
                        </span>
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    className="form-control outer-div"
                    variant="outlined"
                    style={{ position: 'relative' }}
                  >
                    <label
                      htmlFor="description"
                      className="description-label"
                      style={{
                        position: 'absolute',
                        top: '0',
                        left: '10px',
                        transform: 'translate(0, -50%)',
                        color: isFocused ? '#ba18da' : '#646464',
                        backgroundColor: '#fafafa',
                        padding: '0 4px',
                        zIndex: 1,
                      }}
                    >
                      Description
                    </label>
                    <textarea
                      {...field}
                      ref={textAreaRef}
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        field.onChange(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onFocus={() => handleFocus(true)}
                      onBlur={() => {
                        field.onBlur();
                        handleFocus(false);
                      }}
                      className="description_text-field"
                      placeholder="Add app description (max. 200 characters)"
                      style={{
                        paddingBottom: '8px',
                        borderColor: isFocused ? '#ba18da' : '#ccc',
                        letterSpacing: '.15px',
                        backgroundColor: '#FAFAFA',
                      }}
                    />
                    <div ref={overlayRef} className="overlay-text">
                      {getStyledText()}
                    </div>
                    <FormHelperText
                      className="form-helper-text"
                      style={{
                        textAlign: 'right',
                        marginRight: '0',
                        fontSize: '1rem',
                        color: description.length > 200 ? 'red' : 'inherit',
                      }}
                    >
                      {description.length}/200
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </>
          )}
        </StyledFormSection>

        <StyledFormSection>
          <Typography component="h2" variant="subtitle1">
            Configuration
          </Typography>

          <Controller
            name="framework"
            control={control}
            rules={{ required: true }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <FormControl
                error={!!errors.framework}
                fullWidth
                variant="outlined"
              >
                {errors.framework && (
                  <Box
                    display="flex"
                    alignItems="center"
                    color="error.main"
                    mb={2}
                  >
                    <ErrorRoundedIcon fontSize="small" />
                    <Typography variant="body2" color="error" ml={1}>
                      Select a framework
                    </Typography>
                  </Box>
                )}
                <InputLabel
                  id="framework-label"
                  shrink
                  sx={{
                    fontSize: '1rem',
                    transform: 'translate(14px, -6px) scale(0.75)', // Ensure consistent positioning
                    color: errors.framework ? '#f44336' : 'rgba(0, 0, 0, 0.54)',
                    top: errors.framework ? '33px' : '0', // Adjust top based on error// Color changes based on error
                    left: '-4px',
                    padding: '0 4px',
                    zIndex: 1,
                    position: 'absolute',
                    pointerEvents: 'none',
                    transition: 'color 0.3s ease',
                  }}
                >
                  *Framework
                </InputLabel>
                <Select
                  {...field}
                  id="framework"
                  error={!!errors.framework}
                  displayEmpty
                  labelId="framework-label"
                  label="Framework"
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.framework
                        ? '#f44336'
                        : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.framework
                        ? '#f44336'
                        : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: errors.framework ? '#f44336' : '#BA18DA',
                    },
                  }}
                  inputProps={{ 'aria-label': 'Select framework' }}
                >
                  <MenuItem value="" disabled>
                    Select framework
                  </MenuItem>
                  {frameworks?.map((framework) => (
                    <MenuItem key={framework.name} value={framework.name}>
                      {framework.display_name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>*Required</FormHelperText>
              </FormControl>
            )}
          />
          {currentFramework === 'custom' ? (
            <Controller
              name="custom_command"
              control={control}
              rules={{ required: true }}
              render={({ field: { ref, ...field } }) => (
                <FormControl
                  error={!!errors.custom_command}
                  fullWidth
                  variant="outlined"
                  sx={{
                    mb: 3,
                  }}
                >
                  {errors.custom_command && (
                    <Box
                      display="flex"
                      alignItems="center"
                      color="error.main"
                      mb={2}
                    >
                      <ErrorRoundedIcon fontSize="small" />
                      <Typography variant="body2" color="error" ml={1}>
                        Enter a custom command
                      </Typography>
                    </Box>
                  )}
                  <TextField
                    {...field}
                    id="custom_command"
                    label="*Custom Command"
                    placeholder="Enter custom command"
                    inputRef={(e) => {
                      ref(e);
                      if (errors.custom_command) {
                        firstErrorRef.current = e;
                      }
                    }}
                    autoFocus={!!errors.custom_command}
                    error={!!errors.custom_command}
                    inputProps={{ maxLength: 255 }}
                    helperText={
                      <span
                        style={{
                          fontSize: '12px',
                          color: errors.custom_command
                            ? 'error'
                            : 'textSecondary',
                        }}
                      >
                        *Required
                      </span>
                    }
                    InputProps={{
                      style: errors.custom_command
                        ? { borderColor: '#d32f2f' }
                        : {},
                    }}
                    InputLabelProps={{
                      style: {
                        fontSize: '1rem',
                        transform: 'translate(14px, -6px) scale(0.75)', // Keep label position fixed
                        color: errors.custom_command
                          ? '#d32f2f'
                          : 'rgba(0, 0, 0, 0.54)', // Conditional color
                        top: '-3px', // Adjust top for error state if needed
                        position: 'absolute',
                        pointerEvents: 'none',
                        transition: 'color 0.3s ease', // Smooth transition for color
                        // fontWeight: errors.custom_command ? 'bold' : 'normal',
                      },
                      shrink: true,
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </FormControl>
              )}
            />
          ) : (
            <></>
          )}
          {environments && environments.length > 0 ? (
            <Controller
              name="conda_env"
              control={control}
              rules={{ required: true }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, ...field } }) => (
                <FormControl
                  error={!!errors.conda_env}
                  fullWidth
                  variant="outlined"
                >
                  {errors.conda_env && (
                    <Box
                      display="flex"
                      alignItems="center"
                      color="error.main"
                      mb={2}
                    >
                      <ErrorRoundedIcon fontSize="small" />
                      <Typography variant="body2" color="error" ml={1}>
                        Select a software environment
                      </Typography>
                    </Box>
                  )}
                  <InputLabel
                    id="conda_env-label"
                    shrink
                    sx={{
                      fontSize: '1rem',
                      transform: 'translate(14px, -6px) scale(0.75)',
                      color: errors.conda_env
                        ? '#f44336'
                        : 'rgba(0, 0, 0, 0.54)',
                      top: errors.conda_env ? '33px' : '-2px',
                      left: '-5px',
                      padding: '0 4px',
                      zIndex: 1,
                    }}
                  >
                    *Software Environment
                  </InputLabel>
                  <Select
                    {...field}
                    id="conda_env"
                    error={!!errors.conda_env}
                    displayEmpty
                    labelId="conda_env-label"
                    label="Software Environment"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.conda_env
                          ? '#f44336'
                          : 'rgba(0, 0, 0, 0.23)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.conda_env
                          ? '#f44336'
                          : 'rgba(0, 0, 0, 0.87)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: errors.conda_env ? '#f44336' : '#BA18DA',
                      },
                    }}
                    inputProps={{ 'aria-label': 'Select software environment' }}
                  >
                    <MenuItem value="" disabled>
                      Select software environment
                    </MenuItem>
                    {environments.map((env) => (
                      <MenuItem key={env} value={env}>
                        {env}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>*Required</FormHelperText>
                </FormControl>
              )}
            />
          ) : (
            <></>
          )}
          <Controller
            name="filepath"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <FormControl>
                <TextField
                  {...field}
                  id="filepath"
                  label="File path"
                  placeholder='Enter the path to the file, e.g. "/shared/users/panel_basic.py"'
                  error={!!errors.filepath}
                />
              </FormControl>
            )}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Tooltip
              placement="bottom-start"
              title={
                <span style={{ fontSize: '10px', fontWeight: 600 }}>
                  Keep alive prevents the app from being suspended even when not
                  in active use. Your app will be instantly available, but it
                  will consume resources until manually stopped.
                </span>
              }
            >
              <InfoRoundedIcon
                fontSize="small"
                sx={{
                  position: 'relative',
                  top: '9px',
                  left: '2px',
                  color: '#0F10158F',
                }}
              />
            </Tooltip>
            <Controller
              name="keep_alive"
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, value, onChange, ...field } }) => (
                <FormControl sx={{ flexDirection: 'row' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        {...field}
                        id="keep_alive"
                        checked={keepAlive}
                        onChange={() => {
                          setKeepAlive(!keepAlive);
                        }}
                      />
                    }
                    label="Keep app alive"
                    labelPlacement="start"
                  />
                </FormControl>
              )}
            />
          </Box>
        </StyledFormSection>
        <StyledFormSection>
          <Typography component="h2" variant="subtitle1">
            Environment Variables
          </Typography>
          <EnvironmentVariables
            variables={variables}
            setVariables={setVariables}
          />
        </StyledFormSection>
        <StyledFormSection>
          <Typography component="h2" variant="subtitle1">
            Sharing
          </Typography>
          <AppSharing
            url={formData?.url}
            permissions={formData?.user_options?.share_with}
            isPublic={isPublic}
            setCurrentUserPermissions={setCurrentUserPermissions}
            setCurrentGroupPermissions={setCurrentGroupPermissions}
            setIsPublic={setIsPublic}
          />
        </StyledFormSection>
        <StyledFormSection sx={{ pb: '36px' }}>
          <Typography component="h2" variant="subtitle1">
            Custom Thumbnail
          </Typography>
          <Controller
            name="thumbnail"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, value, onChange, ...field } }) => (
              <FormControl sx={{ pb: 0 }}>
                <Thumbnail
                  {...field}
                  id="thumbnail"
                  currentImage={currentImage}
                  setCurrentImage={setCurrentImage}
                  currentFile={currentFile}
                  setCurrentFile={setCurrentFile}
                />
              </FormControl>
            )}
          />
        </StyledFormSection>
        <hr />
        <div className="button-section">
          <div className="prev" hidden={isHeadless}>
            <Button
              id="cancel-btn"
              type="button"
              variant="text"
              color="primary"
              onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
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
              disabled={
                frameworksLoading ||
                environmentsLoading ||
                profilesLoading ||
                submitting ||
                isProcessing || // Disable button while processing
                description.length > 200 ||
                (!isDirty && isEditMode && !hasChanges) || // Prevent submission if no changes have been made
                !isValid
              }
            >
              {isProcessing ? (
                // Show a spinner or "Processing..." text
                <CircularProgress size={24} sx={{ color: '#ba18da' }} />
              ) : profiles && profiles.length > 0 ? (
                <>Next</>
              ) : id ? (
                <>Save</>
              ) : (
                <>Deploy App</>
              )}
            </Button>
          </div>
        </div>
        <Dialog open={openModal} onClose={() => setOpenModal(false)}>
          <DialogTitle>Invalid URL</DialogTitle>
          <DialogContent>
            <Typography>
              It looks like the URL provided isn&apos;t linked to a Git
              repository. Please double-check the URL and try again.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </form>
    </>
  );
};

export default AppForm;
