import { Button } from '@src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/components/ui/dialog';
import { Input } from '@src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/components/ui/select';
import { Switch } from '@src/components/ui/switch';
import { Textarea } from '@src/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@src/components/ui/tooltip';
import { cn } from '@src/lib/utils';
import type {
  AppFrameworkProps,
  AppProfileProps,
  AppQueryGetProps,
  AppQueryUpdateProps,
} from '@src/types/api';
import type { AppFormInput, AppFormProps, RepoData } from '@src/types/form';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getFriendlyDisplayName,
  getFriendlyEnvironmentVariables,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { AlertCircle, Info, Loader2 } from 'lucide-react';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRecoilState } from 'recoil';
import {
  currentNotification,
  currentFile as defaultFile,
  currentFormInput as defaultFormInput,
  currentImage as defaultImage,
  isHeadless as defaultIsHeadless,
  currentServerName as defaultServerName,
  currentUser as defaultUser,
} from '../../store';
import { AppSharing, EnvironmentVariables, Thumbnail } from '..';
import CustomLabel from '../custom-label/custom-label';
import './app-form.css';

const FormSection = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('pb-[30px]', className)} {...props}>
    {children}
  </div>
));
FormSection.displayName = 'FormSection';

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="mb-4 text-base font-normal">{children}</h2>
);

const FieldError = ({ message }: { message: string }) => (
  <div className="mb-2 flex items-center gap-1 text-destructive">
    <AlertCircle className="h-4 w-4" />
    <span className="text-sm">{message}</span>
  </div>
);

const FieldHelper = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span className={cn('text-xs text-muted-foreground', className)}>
    {children}
  </span>
);

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
  const [gitUrl, setGitUrl] = useState<string>('');
  const [isUrlValid, setIsUrlValid] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [customRef, setCustomRef] = useState('');

  const [customConfigDirectory, setCustomConfigDirectory] =
    useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [shouldValidate, setShouldValidate] = useState(false);
  const repoUrlRef = useRef<HTMLInputElement>(null);
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
      profile_image: '',
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
    profile_image: '',
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
    reset({
      display_name: '',
      description: '',
      framework: '',
      thumbnail: '',
      filepath: '',
      conda_env: '',
      custom_command: '',
      profile: '',
      profile_image: '',
      is_public: false,
      keep_alive: false,
    });

    setDescription('');
    setRepoData(null);
    setIsUrlValid(false);
  }, [deployOption, reset]);

  useEffect(() => {
    const filepathFromQuery = decodeURIComponent(
      searchParams.get('filepath') || '',
    );
    setValue('filepath', filepathFromQuery);
  }, [searchParams, setValue]);

  const validateGitUrl = async () => {
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

        if (!customRef) {
          setCustomRef(response.data.ref || 'main');
        }
        if (!customConfigDirectory) {
          setCustomConfigDirectory(response.data.config_directory || '.');
        }

        setValue(
          'repository.config_directory',
          customConfigDirectory || response.data.config_directory || '.',
        );
        setValue('repository.ref', customRef || response.data.ref || 'main');
      } else {
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

      if (isAxiosError(err) && err.response) {
        if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.message) {
          errorMessage = `${err.response.status} - ${err.response.data.message}`;
        } else {
          errorMessage = `${err.response.status} - Unknown error`;
        }
      } else if (isAxiosError(err) && err.request) {
        errorMessage = 'No response from the server.';
      } else if (err instanceof Error) {
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
    if (deployOption === 'git' && repoUrlRef.current) {
      repoUrlRef.current.focus();
    }
  }, [deployOption]);

  useEffect(() => {
    if (isUrlValid && repoData) {
      reset({
        display_name: repoData.display_name || '',
        description: repoData.description || '',
        framework: repoData.framework || '',
        filepath: repoData.filepath || '',
        conda_env: repoData.env.conda_env || '',
        is_public: repoData.public || false,
        keep_alive: repoData.keep_alive || false,
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
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
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
    if (isFetching && !isUrlValid) {
      const interval = setInterval(() => {
        setDisplayedText(fullText.substring(0, index + 1));
        setIndex((prevIndex) => (prevIndex + 1) % fullText.length);
      }, 150);

      return () => clearInterval(interval);
    } else {
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
    profile_image,
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
        profile_image,
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
        profile_image: currentFormInput.profile_image || '',
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
        const yOffset = 120;
        const elementRect = element.getBoundingClientRect();
        const scrollY = window.scrollY || window.scrollY;
        const y = elementRect.top + scrollY - yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => {}, 500);
      }
    };

    setTimeout(() => {
      requestAnimationFrame(() => {
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
          handleSubmit(onFormSubmit, scrollToFirstError)(e);
        }}
        className="form"
        noValidate
      >
        <FormSection ref={appInfoRef}>
          <SectionHeading>
            {deployOption === 'git' ? 'App Info (Git Repository)' : 'App Info'}
          </SectionHeading>

          {deployOption === 'git' ? (
            <>
              <Controller
                name="repository.url"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label
                      htmlFor="repository.url"
                      className="mb-1 block text-sm font-medium"
                    >
                      Git Repository URL{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      {...field}
                      ref={repoUrlRef}
                      id="repository.url"
                      placeholder="https://github.com/nebari-dev/jhub-apps-from-git-repo-example.git"
                      required
                      data-testid="git-url-input"
                      value={gitUrl}
                      onChange={(e) => setGitUrl(e.target.value)}
                      disabled={isFetching}
                      className={cn(
                        !!error && shouldValidate && 'border-destructive',
                      )}
                    />
                    <FieldHelper
                      className={cn(
                        'mt-1 block',
                        !!error && shouldValidate && 'text-destructive',
                      )}
                    >
                      {error && shouldValidate
                        ? error
                        : 'Enter a valid GitHub URL'}
                    </FieldHelper>
                  </div>
                )}
              />

              {isFetching && !isUrlValid && (
                <p className="mb-12 whitespace-pre-wrap text-[color:#ba18da]">
                  {displayedText || ' '.repeat(fullText.length)}
                </p>
              )}

              <Controller
                name="repository.ref"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label
                      htmlFor="branch"
                      className="mb-1 block text-sm font-medium"
                    >
                      Branch
                    </label>
                    <Input
                      {...field}
                      id="branch"
                      placeholder="e.g., main"
                      value={customRef}
                      onChange={(e) => setCustomRef(e.target.value)}
                    />
                  </div>
                )}
              />

              <Controller
                name="repository.config_directory"
                control={control}
                render={({ field }) => (
                  <div className="mb-4">
                    <label
                      htmlFor="conda_project_yml"
                      className="mb-1 block text-sm font-medium"
                    >
                      Conda Project YAML Directory
                    </label>
                    <Input
                      {...field}
                      id="conda_project_yml"
                      placeholder="Enter path to conda-project.yml"
                      value={customConfigDirectory}
                      onChange={(e) => setCustomConfigDirectory(e.target.value)}
                    />
                    <FieldHelper className="mt-1 block">
                      Optional: if conda-project.yml is not present in root
                      directory
                    </FieldHelper>
                  </div>
                )}
              />

              <div className="mb-8">
                <Button
                  type="button"
                  variant="default"
                  onClick={validateGitUrl}
                  disabled={isFetching}
                >
                  Fetch App Configuration
                </Button>
              </div>

              <Controller
                name="display_name"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <div className="mb-4">
                    <label
                      htmlFor="display_name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      {...field}
                      id="display_name"
                      placeholder="Add app name"
                      value={repoData?.display_name || ''}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      disabled={!isUrlValid}
                      className={cn(
                        errors.display_name && 'border-destructive',
                      )}
                    />
                    <FieldHelper className="mt-1 block">*Required</FieldHelper>
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="mb-0">
                    <label
                      htmlFor="description"
                      className="mb-1 block text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      {...field}
                      ref={textAreaRef}
                      rows={5}
                      id="description"
                      value={description}
                      disabled={!isUrlValid}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        field.onChange(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onBlur={field.onBlur}
                      placeholder="Add app description (max. 200 characters)"
                      className={cn(
                        description.length > 200 && 'border-destructive',
                      )}
                    />
                    <div className="mt-1 flex justify-end">
                      <span
                        className={cn(
                          'text-xs',
                          description.length > 200
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                        )}
                      >
                        {description.length}/200
                      </span>
                    </div>
                  </div>
                )}
              />
            </>
          ) : (
            <>
              <Controller
                name="display_name"
                control={control}
                rules={{ required: true }}
                render={({ field: { ref, ...field } }) => (
                  <div className="mb-4">
                    {errors.display_name && (
                      <FieldError message="Enter an app name" />
                    )}
                    <label
                      htmlFor="display_name"
                      className="mb-1 block text-sm font-medium"
                    >
                      <CustomLabel label="Name" required={true} />
                    </label>
                    <Input
                      {...field}
                      id="display_name"
                      placeholder="Add app name"
                      ref={(e) => {
                        ref(e);
                        if (errors.display_name) {
                          firstErrorRef.current = e;
                        }
                      }}
                      autoFocus
                      maxLength={255}
                      className={cn(
                        errors.display_name && 'border-destructive',
                      )}
                    />
                    <FieldHelper
                      className={cn(
                        'mt-1 block',
                        errors.display_name && 'text-destructive',
                      )}
                    >
                      *Required
                    </FieldHelper>
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="mb-0">
                    <label
                      htmlFor="description"
                      className="mb-1 block text-sm font-medium"
                    >
                      Description
                    </label>
                    <Textarea
                      {...field}
                      ref={textAreaRef}
                      rows={5}
                      id="description"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        field.onChange(e.target.value);
                        adjustTextareaHeight(e.target);
                      }}
                      onBlur={field.onBlur}
                      placeholder="Add app description (max. 200 characters)"
                      className={cn(
                        description.length > 200 && 'border-destructive',
                      )}
                    />
                    <div className="mt-1 flex justify-end">
                      <span
                        className={cn(
                          'text-xs',
                          description.length > 200
                            ? 'text-destructive'
                            : 'text-muted-foreground',
                        )}
                      >
                        {description.length}/200
                      </span>
                    </div>
                  </div>
                )}
              />
            </>
          )}
        </FormSection>

        <FormSection>
          <SectionHeading>Configuration</SectionHeading>
          <Controller
            name="framework"
            control={control}
            rules={{ required: true }}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <div className="mb-4">
                {errors.framework && (
                  <FieldError message="Select a software framework" />
                )}
                <label
                  htmlFor="framework"
                  className="mb-1 block text-sm font-medium"
                >
                  *Framework
                </label>
                <Select
                  value={field.value || ''}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="framework"
                    aria-label="Select framework"
                    className={cn(errors.framework && 'border-destructive')}
                  >
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {frameworks?.map((framework) => (
                      <SelectItem key={framework.name} value={framework.name}>
                        {framework.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldHelper className="mt-1 block">*Required</FieldHelper>
              </div>
            )}
          />

          {currentFramework === 'custom' ? (
            <Controller
              name="custom_command"
              control={control}
              rules={{ required: true }}
              render={({ field: { ref, ...field } }) => (
                <div className="mb-6">
                  {errors.custom_command && (
                    <FieldError message="Enter a custom command" />
                  )}
                  <label
                    htmlFor="custom_command"
                    className="mb-1 block text-sm font-medium"
                  >
                    *Custom Command
                  </label>
                  <Input
                    {...field}
                    id="custom_command"
                    placeholder="Enter custom command"
                    ref={(e) => {
                      ref(e);
                      if (errors.custom_command) {
                        firstErrorRef.current = e;
                      }
                    }}
                    autoFocus={!!errors.custom_command}
                    maxLength={255}
                    className={cn(
                      errors.custom_command && 'border-destructive',
                    )}
                  />
                  <FieldHelper
                    className={cn(
                      'mt-1 block',
                      errors.custom_command && 'text-destructive',
                    )}
                  >
                    *Required
                  </FieldHelper>
                </div>
              )}
            />
          ) : null}

          {environments && environments.length > 0 ? (
            <Controller
              name="conda_env"
              control={control}
              rules={{ required: true }}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, ...field } }) => (
                <div className="mb-4">
                  {errors.conda_env && (
                    <FieldError message="Select a software environment" />
                  )}
                  <label
                    htmlFor="conda_env"
                    className="mb-1 block text-sm font-medium"
                  >
                    *Software Environment
                  </label>
                  <Select
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="conda_env"
                      aria-label="Select software environment"
                      className={cn(errors.conda_env && 'border-destructive')}
                    >
                      <SelectValue placeholder="Select software environment" />
                    </SelectTrigger>
                    <SelectContent>
                      {environments.map((env) => (
                        <SelectItem key={env} value={env}>
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldHelper className="mt-1 block">*Required</FieldHelper>
                </div>
              )}
            />
          ) : null}

          <Controller
            name="filepath"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, ...field } }) => (
              <div className="mb-4">
                <label
                  htmlFor="filepath"
                  className="mb-1 block text-sm font-medium"
                >
                  File path
                </label>
                <Input
                  {...field}
                  id="filepath"
                  placeholder='Enter the path to the file, e.g. "/shared/users/panel_basic.py"'
                  className={cn(errors.filepath && 'border-destructive')}
                />
              </div>
            )}
          />

          <div className="flex flex-row items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="relative top-1 mr-1 h-4 w-4 text-[color:#0F10158F]" />
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                  <span className="text-[10px] font-semibold">
                    Keep alive prevents the app from being suspended even when
                    not in active use. Your app will be instantly available, but
                    it will consume resources until manually stopped.
                  </span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Controller
              name="keep_alive"
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref, value, onChange, ...field } }) => (
                <label
                  htmlFor="keep_alive"
                  className="ml-2 flex flex-row items-center gap-2 text-sm"
                >
                  <span>Keep app alive</span>
                  <Switch
                    {...field}
                    id="keep_alive"
                    checked={keepAlive}
                    onCheckedChange={() => setKeepAlive(!keepAlive)}
                  />
                </label>
              )}
            />
          </div>
        </FormSection>

        <FormSection>
          <SectionHeading>Environment Variables</SectionHeading>
          <EnvironmentVariables
            variables={variables}
            setVariables={setVariables}
          />
        </FormSection>

        <FormSection>
          <SectionHeading>Sharing</SectionHeading>
          <AppSharing
            url={formData?.url}
            permissions={formData?.user_options?.share_with}
            isPublic={isPublic}
            setCurrentUserPermissions={setCurrentUserPermissions}
            setCurrentGroupPermissions={setCurrentGroupPermissions}
            setIsPublic={setIsPublic}
          />
        </FormSection>

        <FormSection className="pb-9">
          <SectionHeading>Custom Thumbnail</SectionHeading>
          <Controller
            name="thumbnail"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref, value, onChange, ...field } }) => (
              <div>
                <Thumbnail
                  {...field}
                  id="thumbnail"
                  currentImage={currentImage}
                  setCurrentImage={setCurrentImage}
                  currentFile={currentFile}
                  setCurrentFile={setCurrentFile}
                />
              </div>
            )}
          />
        </FormSection>

        <hr />
        <div className="button-section">
          <div className="prev" hidden={isHeadless}>
            <Button
              id="cancel-btn"
              type="button"
              variant="ghost"
              onClick={() => navigateToUrl(`${APP_BASE_URL}`)}
            >
              Cancel
            </Button>
          </div>
          <div className="next">
            <Button
              id="submit-btn"
              type="submit"
              variant="default"
              disabled={
                frameworksLoading ||
                environmentsLoading ||
                profilesLoading ||
                submitting ||
                isProcessing ||
                description.length > 200 ||
                (!isDirty && isEditMode && !hasChanges) ||
                !isValid
              }
            >
              {isProcessing ? (
                <Loader2 className="h-6 w-6 animate-spin text-[color:#ba18da]" />
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
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <p>
              {error ||
                "It looks like the URL provided isn't linked to a Git repository. Please double-check the URL and try again."}
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="default"
                onClick={() => setOpenModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </>
  );
};

export default AppForm;
