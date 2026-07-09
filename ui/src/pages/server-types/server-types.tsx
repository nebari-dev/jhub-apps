import { Button } from '@src/components/ui/button';
import { Card } from '@src/components/ui/card';
import { Input } from '@src/components/ui/input';
import { Label } from '@src/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@src/components/ui/radio-group';
import type { AppProfileProps, AppQueryUpdateProps } from '@src/types/api';
import type { AppFormInput } from '@src/types/form';
import type { UserState } from '@src/types/user';
import axios from '@src/utils/axios';
import { APP_BASE_URL } from '@src/utils/constants';
import {
  getFriendlyEnvironmentVariables,
  navigateToUrl,
} from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  const [profileImages, setProfileImages] = React.useState<
    Record<string, string>
  >({});
  const [isHeadless] = useRecoilState<boolean>(defaultIsHeadless);
  const id = searchParams.get('id');

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
        profile_image: profileImages[slug] || '',
      });
    }
  };

  const handleImageChange = (slug: string, image: string) => {
    setProfileImages({
      ...profileImages,
      [slug]: image,
    });
    if (selectedServerType === slug && currentFormInput) {
      setCurrentFormInput({
        ...currentFormInput,
        profile_image: image,
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
        profile_image: currentFormInput?.profile_image || '',
        public: currentFormInput?.is_public || false,
        share_with: {
          users: currentFormInput?.share_with?.users || [],
          groups: currentFormInput?.share_with?.groups || [],
        },
        keep_alive: currentFormInput?.keep_alive || false,
        repository: currentFormInput?.repository || undefined,
      },
    };
    setSubmitting(true);
    if (id) {
      updateQuery(payload, {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          window.location.assign(APP_BASE_URL);
        },
        onError: async (error: Error) => {
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
                `/hub/spawn-pending/${username}/${server}`,
              );
            }
          }
        },
        onError: async (error: Error) => {
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

  // Effect 1: Initialize profile images from serverTypes with default images
  useEffect(() => {
    if (!serverTypes || serverTypes.length === 0) {
      return;
    }

    const images: Record<string, string> = {};
    let defaultProfileSlug = '';

    serverTypes.forEach((type, index) => {
      const defaultImage = type.kubespawner_override?.image || '';
      images[type.slug] = defaultImage;

      // Find the default profile or use the first one
      if (type.default || (!defaultProfileSlug && index === 0)) {
        defaultProfileSlug = type.slug;
      }
    });

    setProfileImages(images);

    // Auto-select default profile if no profile is currently selected
    if (!currentFormInput?.profile && defaultProfileSlug && currentFormInput) {
      setSelectedServerType(defaultProfileSlug);
      setCurrentFormInput({
        ...currentFormInput,
        profile: defaultProfileSlug,
        profile_image: images[defaultProfileSlug] || '',
      });
    }
  }, [serverTypes, currentFormInput, setCurrentFormInput]);

  // Effect 2: Populate custom profile image when coming from edit mode
  // This runs when the profile changes (e.g., when navigating to this page with edit data)
  useEffect(() => {
    if (
      !serverTypes ||
      serverTypes.length === 0 ||
      !currentFormInput?.profile
    ) {
      return;
    }

    const profileImage = currentFormInput.profile_image;
    if (!profileImage) {
      return;
    }

    // Find the matching server type to get its default image
    const matchingType = serverTypes.find(
      (type) => type.slug === currentFormInput.profile,
    );
    const defaultImage = matchingType?.kubespawner_override?.image || '';

    // Only update if the profile_image is different from the default
    // (meaning the user had customized it previously)
    if (profileImage !== defaultImage && currentFormInput.profile) {
      setProfileImages((prev) => ({
        ...prev,
        [currentFormInput.profile as string]: profileImage,
      }));
    }
  }, [serverTypes, currentFormInput?.profile, currentFormInput?.profile_image]);

  return (
    <div className="container">
      <div className="flex flex-col">
        <div hidden={isHeadless}>
          <div className="form-breadcrumb">
            <Button
              id="back-btn"
              type="button"
              variant="ghost"
              onClick={() => navigateToUrl(APP_BASE_URL)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back To Home
            </Button>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Server Type</h1>
          <p className="max-w-[600px] pt-[10px] pb-[30px]">
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
          </p>
        </div>
        <div>
          {isLoading ? (
            <div className="font-bold center">Loading...</div>
          ) : serverTypes && serverTypes.length > 0 ? (
            <form className="form" onSubmit={handleSubmit}>
              <div className="pb-9">
                <RadioGroup
                  value={selectedServerType}
                  onValueChange={handleCardClick}
                >
                  {serverTypes?.map((type: AppProfileProps) => (
                    <Card
                      key={`server-type-card-${type.slug}`}
                      className="server-type-card border-0 shadow-md"
                    >
                      <Label
                        htmlFor={type.slug}
                        className="block cursor-pointer p-6"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <RadioGroupItem value={type.slug} id={type.slug} />
                          <span>{type.display_name}</span>
                        </div>
                        <p>{type.description}</p>
                      </Label>
                      {type.kubespawner_override?.image && (
                        <div className="px-6 pb-6">
                          <Label
                            htmlFor={`${type.slug}-image`}
                            className="mb-1 block"
                          >
                            Image
                          </Label>
                          <Input
                            id={`${type.slug}-image`}
                            value={profileImages[type.slug] || ''}
                            onChange={(e) =>
                              handleImageChange(type.slug, e.target.value)
                            }
                            placeholder={type.kubespawner_override.image}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </RadioGroup>
              </div>
              <hr />
              <div className="button-section">
                <div className="prev">
                  <Button
                    id="cancel-btn"
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      navigate(id ? `/edit-app?id=${id}` : '/create-app')
                    }
                  >
                    Back
                  </Button>
                </div>
                <div className="next">
                  <Button id="submit-btn" type="submit" disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : id ? (
                      'Save'
                    ) : (
                      'Deploy App'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div>No servers available</div>
          )}
        </div>
      </div>
    </div>
  );
};
