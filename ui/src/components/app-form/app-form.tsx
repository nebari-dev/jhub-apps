import { AppFormInput } from '@src/types/form';
import { REQUIRED_FORM_FIELDS_RULES } from '@src/utils/constants';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  ErrorMessages,
  FormGroup,
  Label,
  Select,
  TextArea,
  TextInput,
} from '..';

export interface AppFormProps {
  id?: string;
}

export const AppForm = ({ id }: AppFormProps): React.ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppFormInput>({
    defaultValues: {
      display_name: '',
      filepath: '',
      thumbnail: '',
      description: '',
      framework: '',
      conda_env: '',
      custom_command: '',
    },
  });

  if (id) {
    console.log(id);
  }

  const onSubmit: SubmitHandler<AppFormInput> = () => {
    // navigate('/');
  };

  return (
    <form id="app-form" onSubmit={handleSubmit(onSubmit)} className="form">
      <FormGroup>
        <Label htmlFor="display_name">Display Name</Label>
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
          rules={REQUIRED_FORM_FIELDS_RULES}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextArea {...field} id="description" />
          )}
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="framework">Framework</Label>
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
                { value: 'Panel', label: 'Panel' },
                { value: 'Bokeh', label: 'Bokeh' },
                { value: 'Streamlit', label: 'Streamlit' },
                { value: 'Voila', label: 'Voila' },
                { value: 'PlotlyDash', label: 'PlotlyDash' },
                { value: 'Gradio', label: 'Gradio' },
                { value: 'JupyterLab', label: 'JupyterLab' },
                { value: 'Custom Command', label: 'Custom Command' },
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
          rules={REQUIRED_FORM_FIELDS_RULES}
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
          rules={REQUIRED_FORM_FIELDS_RULES}
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
          rules={REQUIRED_FORM_FIELDS_RULES}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          render={({ field: { ref: _, ...field } }) => (
            <TextInput {...field} id="custom_command" />
          )}
        />
      </FormGroup>
    </form>
  );
};

export default AppForm;
