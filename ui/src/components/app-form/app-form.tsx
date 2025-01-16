import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { isAxiosError } from 'axios';
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
  const [customRef, setCustomRef] = useState('');

  const [customConfigDirectory, setCustomConfigDirectory] =
    useState<string>('');

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
      repository: {
        url: '',
        config_directory: '.',
        ref: 'main',
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
      setError('Invalid GitHub URL format.');
      setIsUrlValid(false);
      setOpenModal(true);
      return;
    }

    try {
      setIsFetching(true);
      setError(null);

      const branch = customRef || 'main';
      const response = await axios.post(
        '/app-config-from-git/',
        {
          url: gitUrl,
          config_directory: customConfigDirectory,
          ref: branch,
        },
        {
          validateStatus: (status) => status < 500,
        },
      );
      if (response && response.status === 200) {
        setIsUrlValid(true);
        setRepoData(response.data);

        // Only update `customRef` and `customConfigDirectory` if they are empty
        if (!customRef) {
          setCustomRef(response.data.ref || 'main');
        }
        if (!customConfigDirectory) {
          setCustomConfigDirectory(response.data.config_directory || '.');
        }

        // Update form values using `setValue`
        setValue(
          'repository.config_directory',
          customConfigDirectory || response.data.config_directory || '.',
        );
        setValue('repository.ref', customRef || response.data.ref || 'main');
      } else {
        // Manually treat any non-200 response as an error
        const errorMessage =
          response.data?.detail || 'Repository not found or invalid.';
        setIsUrlValid(false);
        setError(`${errorMessage}`);
        setOpenModal(true);
      }
    } catch (err) {
      setIsUrlValid(false);
      setOpenModal(true);
      let errorMessage = 'Unknown error occurred.';

      // Check if the error is an AxiosError and has a response
      if (isAxiosError(err) && err.response) {
        // Prioritize specific error detail in the response
        if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.message) {
          errorMessage = `${err.response.status} - ${err.response.data.message}`;
        } else {
          errorMessage = `${err.response.status} - Unknown error`;
        }
      } else if (isAxiosError(err) && err.request) {
        // Handle the case where the request was made but no response was received
        errorMessage = 'No response from the server.';
      } else if (err instanceof Error) {
        // Handle general errors that are not Axios-specific
        errorMessage = `${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (deployOption === 'git' && customRef === '') {
      setCustomRef('');
    }
  }, [deployOption, customRef]);

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

      setDescription(repoData.description || '');
      setKeepAlive(repoData.keep_alive || false);
      setVariables(getFriendlyEnvironmentVariables(repoData.env));
      setIsPublic(repoData.public || false);
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
        repository:
          deployOption === 'git'
            ? {
                url: gitUrl,
                config_directory: customConfigDirectory,
                ref: customRef,
              }
            : undefined,
      };

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
          repository:
            deployOption === 'git'
              ? {
                  url: gitUrl,
                  config_directory: customConfigDirectory,
                  ref: customRef,
                }
              : undefined,
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
              // If headless, navigate to success page, else redirect to spawn-pending page
              if (isHeadless) {
                navigate(`/success?id=${server}`);
              } else {
                window.location.assign(
                  `${APP_BASE_URL}/spawn-pending/${username}/${server}`,
                );
              }
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
    // eslint-disable-next-line no-console
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
    if (isUrlValid && repoData) {
      // Prepopulate only if the fields are still empty (i.e., user hasn’t modified them)
      if (customRef === '') {
        setCustomRef(repoData.repository?.ref || 'main');
      }
      if (customConfigDirectory === '') {
        setCustomConfigDirectory(repoData.repository?.config_directory || '.');
      }
    }
  }, [isUrlValid, repoData]);

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
                      placeholder="https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"
                      required
                      data-testid="git-url-input"
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
                name="repository.ref"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <TextField
                      {...field}
                      id="branch"
                      label="Branch"
                      placeholder="e.g., main"
                      value={customRef} // Controlled by customRef state
                      onChange={(e) => setCustomRef(e.target.value)}
                    />
                  </FormControl>
                )}
              />
              {/* Conda YAML Directory Input */}
              <Controller
                name="repository.config_directory"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    {/* Label for Conda YAML Directory */}
                    <InputLabel
                      htmlFor="conda_project_yml"
                      shrink
                      sx={labelStyle}
                    >
                      Conda Project YAML Directory
                    </InputLabel>

                    {/* Conda YAML Directory TextField */}
                    <TextField
                      {...field}
                      id="conda_project_yml"
                      placeholder="Enter path to conda-project.yml"
                      value={customConfigDirectory}
                      onChange={(e) => setCustomConfigDirectory(e.target.value)}
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
                      Select a software framework
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
                  error={!!errors.conda_env}
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
          <DialogTitle>Error</DialogTitle>
          <DialogContent>
            <Typography>
              {error ||
                "It looks like the URL provided isn't linked to a Git repository. Please double-check the URL and try again."}
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
