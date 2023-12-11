import { AppCreateProps, AppFormInput } from '@src/types/form';
import axios from '@src/utils/axios';
import { REQUIRED_FORM_FIELDS_RULES } from '@src/utils/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  Button,
  ButtonGroup,
  ErrorMessages,
  FormGroup,
  Label,
  Select,
  TextArea,
  TextInput,
} from '..';

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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppFormInput>({
    defaultValues: {
      display_name: '',
      description: '',
      framework: '',
      thumbnail: '',
      filepath: '',
      conda_env: '',
      custom_command: '',
      profile: '',
    },
  });

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
    const payload = {
      servername: display_name,
      user_options: {
        jhub_app: true,
        display_name,
        description: description ? description : '',
        framework,
        thumbnail: thumbnail ? thumbnail : '',
        filepath: filepath ? filepath : '',
        conda_env: conda_env ? conda_env : '',
        custom_command: custom_command ? custom_command : '',
        profile: profile ? profile : '',
      },
    };

    console.log('here');
    if (id) {
      updateQuery(payload, {
        onSuccess: async () => {
          queryClient.invalidateQueries(['app-state']);
          if (onSubmit) {
            onSubmit();
          }
        },
      });
    } else {
      createQuery(payload, {
        onSuccess: async () => {
          queryClient.invalidateQueries(['app-state']);
          if (onSubmit) {
            onSubmit();
          }
        },
      });
    }
  };

  const createRequest = async ({
    servername,
    user_options,
  }: AppCreateProps) => {
    const response = await axios.post('/server', { servername, user_options });
    return response.data;
  };

  const updateRequest = async ({
    servername,
    user_options,
  }: AppCreateProps) => {
    const response = await axios.put(`/server/${servername}`, {
      servername,
      user_options,
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

  return (
    <form id="app-form" onSubmit={handleSubmit(onFormSubmit)} className="form">
      <FormGroup>
        <Label htmlFor="display_name" required>
          Display Name
        </Label>
        <Controller
          name="display_name"
          control={control}
          rules={REQUIRED_FORM_FIELDS_RULES}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextInput {...field} id="display_name" autoFocus />
          )}
        />
        {errors.display_name?.message && (
          <ErrorMessages errors={[errors.display_name.message]} />
        )}
      </FormGroup>
      <FormGroup>
        <Label htmlFor="description">Description</Label>
        <Controller
          name="description"
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextArea {...field} id="description" />
          )}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="framework" required>
          Framework
        </Label>
        <Controller
          name="framework"
          control={control}
          rules={REQUIRED_FORM_FIELDS_RULES}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <Select
              {...field}
              id="framework"
              options={[
                { value: '', label: 'Select...' },
                { value: 'panel', label: 'Panel' },
                { value: 'bokeh', label: 'Bokeh' },
                { value: 'streamlit', label: 'Streamlit' },
                { value: 'voila', label: 'Voila' },
                { value: 'plotlydash', label: 'PlotlyDash' },
                { value: 'gradio', label: 'Gradio' },
                { value: 'jupyterlab', label: 'JupyterLab' },
                { value: 'custom', label: 'Custom Command' },
              ]}
            ></Select>
          )}
        />
        {errors.framework?.message && (
          <ErrorMessages errors={[errors.framework.message]} />
        )}
      </FormGroup>
      <FormGroup>
        <Label htmlFor="filepath">Filepath</Label>
        <Controller
          name="filepath"
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextInput {...field} id="filepath" />
          )}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="conda_env">Conda Environment</Label>
        <Controller
          name="conda_env"
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextInput {...field} id="conda_env" />
          )}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="custom_command">Custom Command</Label>
        <Controller
          name="custom_command"
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextInput {...field} id="custom_command" />
          )}
        />
      </FormGroup>
      <ButtonGroup>
        <Button
          id="cancel"
          type="button"
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button id="submit" type="submit">
          Submit
        </Button>
      </ButtonGroup>
    </form>
  );
};

export default AppForm;
