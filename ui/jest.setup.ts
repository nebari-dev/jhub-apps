export {};

declare global {
  interface Window {
    jhdata: any;
  }
}

window.jhdata = {
  base_url: '/hub/',
  prefix: '/',
  user: 'test',
  admin_access: false,
  options_form: false,
  xsrf_token: '2|12345|12345|12345',
};
