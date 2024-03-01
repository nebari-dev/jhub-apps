import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  AppFrameworkProps,
  AppQueryGetProps,
  AppQueryUpdateProps,
} from '@src/types/api';
import { AppFormInput } from '@src/types/form';
import axios from '@src/utils/axios';
import { REQUIRED_FORM_FIELDS_RULES } from '@src/utils/constants';
import { getJhData } from '@src/utils/jupyterhub';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilState } from 'recoil';
import { ErrorMessages, FormGroup, Label, Thumbnail, Toggle } from '..';
import { currentNotification } from '../../store';

export interface AppFormProps {
  id?: string;
  onCancel?: () => void;
  onSubmit?: () => void;
}

export const AppForm = ({
  id,
  onCancel,
  onSubmit,
}: AppFormProps): React.ReactElement => {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [, setNotification] = useRecoilState<string | undefined>(
    currentNotification,
  );
  const [name, setName] = useState('');
  const [currentFile, setCurrentFile] = useState<File>();
  const [currentImage, setCurrentImage] = useState<string>();
  const [isPublic, setIsPublic] = useState(false);
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AppFormInput>({
    defaultValues: {
      display_name: '',
      description: '',
      framework: '',
      thumbnail: '',
      filepath: '',
      conda_env: '',
      env: '',
      custom_command: '',
      profile: '',
      is_public: false,
    },
  });
  const currentFramework = watch('framework');

  const onFormSubmit: SubmitHandler<AppFormInput> = ({
    display_name,
    description,
    framework,
    thumbnail,
    filepath,
    conda_env,
    env,
    custom_command,
    profile,
  }) => {
    const payload = {
      servername: name || display_name,
      user_options: {
        jhub_app: true,
        name: name || display_name,
        display_name,
        description: description || '',
        framework,
        thumbnail: thumbnail || '',
        filepath: filepath || '',
        conda_env: conda_env || '',
        env: env ? JSON.parse(env) : null,
        custom_command: custom_command || '',
        profile: profile || '',
        public: isPublic,
      },
    };

    setSubmitting(true);
    if (id) {
      updateQuery(payload, {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ['app-state'] });
          if (onSubmit) {
            onSubmit();
          }
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
          const username = getJhData().user;
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
    if (formData?.name && formData?.user_options) {
      setName(formData.name);
      reset({ ...formData.user_options });
      setIsPublic(formData.user_options.public);
      setCurrentImage(formData.user_options.thumbnail);
    }
  }, [formData?.name, formData?.user_options, reset]);

  useEffect(() => {
    if (formError) {
      setNotification(formError.message);
    }
  }, [formError, setNotification]);

  return (
    <form id="app-form" onSubmit={handleSubmit(onFormSubmit)} className="form">
      <div className="form-section">
        <h2>App Info</h2>
        <FormGroup
          errors={
            errors.display_name?.message
              ? [errors.display_name.message]
              : undefined
          }
        >
          <Controller
            name="display_name"
            control={control}
            rules={REQUIRED_FORM_FIELDS_RULES}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, ...field } }) => (
              <TextField
                {...field}
                id="display_name"
                label="Name"
                autoFocus
                required
                error={errors.display_name?.message ? true : false}
              />
            )}
          />
          {errors.display_name?.message && (
            <ErrorMessages errors={[errors.display_name.message]} />
          )}
        </FormGroup>
        <FormGroup>
          <Controller
            name="description"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, ...field } }) => (
              <TextField
                {...field}
                id="description"
                label="Description"
                multiline
                rows={4}
              />
            )}
          />
        </FormGroup>
      </div>
      <div className="form-section">
        <h2>Configuration</h2>
        <FormGroup
          errors={
            errors.framework?.message ? [errors.framework.message] : undefined
          }
        >
          <Controller
            name="framework"
            control={control}
            rules={REQUIRED_FORM_FIELDS_RULES}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, ...field } }) => (
              <FormControl>
                <InputLabel id="framework-label" required>
                  Framework
                </InputLabel>
                <Select
                  {...field}
                  id="framework"
                  label="Framework"
                  required
                  error={errors.framework?.message ? true : false}
                >
                  {frameworks?.map((framework: AppFrameworkProps) => (
                    <MenuItem key={framework.name} value={framework.name}>
                      {framework.display_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />
          {errors.framework?.message && (
            <ErrorMessages errors={[errors.framework.message]} />
          )}
        </FormGroup>
        {currentFramework === 'custom' ? (
          <FormGroup
            errors={
              errors.custom_command?.message
                ? [errors.custom_command.message]
                : undefined
            }
          >
            <Controller
              name="custom_command"
              control={control}
              rules={REQUIRED_FORM_FIELDS_RULES}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref: _, ...field } }) => (
                <TextField
                  {...field}
                  id="custom_command"
                  label="Custom Command"
                  required={currentFramework === 'custom'}
                />
              )}
            />
            {errors.custom_command?.message && (
              <ErrorMessages errors={[errors.custom_command.message]} />
            )}
          </FormGroup>
        ) : (
          <></>
        )}
        {environments && environments.length > 0 ? (
          <FormGroup
            errors={
              errors.conda_env?.message ? [errors.conda_env.message] : undefined
            }
          >
            <Controller
              name="conda_env"
              control={control}
              rules={REQUIRED_FORM_FIELDS_RULES}
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              render={({ field: { ref: _, ...field } }) => (
                <FormControl>
                  <InputLabel id="framework-label" required>
                    Software Environment
                  </InputLabel>
                  <Select
                    {...field}
                    id="conda_env"
                    label="Software Environment"
                  >
                    {environments.map((env: string) => (
                      <MenuItem key={env} value={env}>
                        {env}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            {errors.conda_env?.message && (
              <ErrorMessages errors={[errors.conda_env.message]} />
            )}
          </FormGroup>
        ) : (
          <></>
        )}
        <FormGroup
          errors={errors.env?.message ? [errors.env.message] : undefined}
        >
          <Controller
            name="env"
            control={control}
            // rules={REQUIRED_FORM_FIELDS_RULES}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, ...field } }) => (
              <TextField
                {...field}
                id="env"
                label="Environment Variables"
                placeholder={`Enter valid json: {"KEY_1":"VALUE_1","KEY_2":"VALUE_2"}`}
              />
            )}
          />
          {errors.env?.message && (
            <ErrorMessages errors={[errors.env.message]} />
          )}
        </FormGroup>
      </div>
      <div className="form-section">
        <h2>Select</h2>
        <FormGroup>
          <Controller
            name="filepath"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, ...field } }) => (
              <TextField {...field} id="filepath" label="Filepath" />
            )}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="thumbnail">Thumbnail</Label>
          <Controller
            name="thumbnail"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, value, onChange, ...field } }) => (
              <Thumbnail
                {...field}
                id="thumbnail"
                currentImage={currentImage}
                setCurrentImage={setCurrentImage}
                currentFile={currentFile}
                setCurrentFile={setCurrentFile}
              />
            )}
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="is_public">Allow Public Access</Label>
          <Controller
            name="is_public"
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render={({ field: { ref: _, value, onChange, ...field } }) => (
              <Toggle
                {...field}
                id="is_public"
                checked={isPublic}
                ariaLabel="Allow Public Access"
                onChange={() => {
                  setIsPublic(!isPublic);
                }}
              />
            )}
          />
        </FormGroup>
      </div>
      <div className="button-section">
        <div className="prev">
          <Button
            id="cancel-btn"
            type="button"
            variant="text"
            color="secondary"
            onClick={onCancel}
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
            disabled={submitting || frameworksLoading || environmentsLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AppForm;
