export interface FormInput {
  username: string;
  password: string;
}

export interface AppFormInput {
  name: string;
  filepath?: string;
  thumbnail?: string;
  description?: string;
  framework: string;
}
