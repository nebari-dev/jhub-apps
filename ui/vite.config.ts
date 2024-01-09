import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment';
import eslint from 'vite-plugin-eslint';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), eslint(), EnvironmentPlugin('all')],
  server: {
    port: 8080,
    proxy: {
      '/services/japps/services/': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(
            JSON.stringify({
              Argo: {
                display: true,
                info: {
                  name: 'Argo Workflows',
                  url: '/hub/argo',
                  external: true,
                },
              },
              Users: {
                display: true,
                info: {
                  name: 'User Management',
                  url: '/auth/admin/nebari/console/',
                  external: true,
                },
              },
              Environments: {
                display: true,
                info: {
                  name: 'Environments',
                  url: '/hub/conda-store',
                  external: true,
                },
              },
              Monitoring: {
                display: true,
                info: {
                  name: 'Monitoring',
                  url: '/hub/monitoring',
                  external: true,
                },
              },
            }),
          );
        },
      },
      '/services/japps/server/test-app': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(
            JSON.stringify({
              name: 'test-app',
              last_activity: '',
              started: null,
              pending: null,
              ready: true,
              stopped: false,
              url: 'http://',
              user_options: {
                jhub_app: true,
                display_name: 'App 1',
                description: 'App Description',
                thumbnail: '',
                filepath: '',
                framework: 'panel',
                custom_command: '',
                conda_env: 'env1',
                profile: 'Small Instance',
                public: true,
              },
              progress_url: '',
              state: {},
            }),
          );
        },
      },
      '/services/japps/server/': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(
            JSON.stringify({
              user_apps: [
                {
                  name: '',
                  url: '/user/test',
                  ready: true,
                  user_options: {},
                },
                {
                  name: 'test-app',
                  url: '/user/test/test-app/',
                  ready: true,
                  user_options: {
                    name: 'test-app',
                    jhub_app: true,
                    display_name: 'Test App',
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
                    thumbnail:
                      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
                    framework: 'Panel',
                    public: true,
                  },
                },
                {
                  name: 'test-app-2',
                  url: '/user/test/test-app-2/',
                  ready: false,
                  user_options: {
                    name: 'test-app-2',
                    jhub_app: true,
                    display_name: 'Test App 2',
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Bras.',
                    thumbnail:
                      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
                    framework: 'Streamlit',
                    public: false,
                  },
                },
                {
                  name: 'test-app-3',
                  url: '/user/test/test-app-3/',
                  ready: false,
                  user_options: {
                    name: 'test-app-3',
                    jhub_app: true,
                    display_name: 'Test App 3',
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Dras.',
                    thumbnail: null,
                    framework: 'JupyterLab',
                    public: false,
                  },
                },
                {
                  name: 'test-app-4',
                  url: '/user/test/test-app-4/',
                  ready: false,
                  user_options: {
                    name: 'test-app-4',
                    jhub_app: true,
                    display_name: 'Test App 4',
                    description: 'Cras.',
                    thumbnail: null,
                    framework: 'Streamlit',
                    public: false,
                  },
                },
              ],
              shared_apps: [
                {
                  name: 'shared-app',
                  url: '/shared/test/shared-app/',
                  ready: true,
                  username: 'Test User',
                  user_options: {
                    name: 'shared-app',
                    jhub_app: true,
                    display_name: 'Shared App',
                    description:
                      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
                    thumbnail:
                      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
                    framework: 'Panel',
                    public: false,
                  },
                },
              ],
            }),
          );
        },
      },
      '/services/japps/frameworks': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(
            JSON.stringify([
              { name: 'panel', display_name: 'Panel', logo: '' },
              { name: 'bokeh', display_name: 'Bokeh', logo: '' },
              { name: 'jupyterlab', display_name: 'JupyterLab', logo: '' },
              { name: 'custom', display_name: 'Custom Command', logo: '' },
            ]),
          );
        },
      },
      '/services/japps/conda-environments': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(JSON.stringify(['env1', 'env2', 'env3', 'env4', 'env5']));
        },
      },
      '/services/japps/spawner-profiles': {
        target: 'http://localhost:8080',
        // Bypass any JuptyerHub API calls and mock with static data
        bypass(req, res, options) {
          res.end(
            JSON.stringify([
              { name: 'small', display_name: 'Small Instance' },
              { name: 'medium', display_name: 'Medium Instance' },
              { name: 'large', display_name: 'Large Instance' },
            ]),
          );
        },
      },
    },
  },
});
