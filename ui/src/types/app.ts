export interface JupyterHubApp {
  id: string;
  name: string;
  description?: string;
  appType: string;
  url?: string;
  imgUrl?: string;
  shared: boolean;
}
