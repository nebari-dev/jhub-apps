import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { nebari } from '@nebari/starlight';

// This site lives on its own domain (no base path), so content links and
// /img/... asset references work as written — no rehype link rewriting needed.
export default defineConfig({
  site: 'https://jhub-apps.nebari.dev',
  integrations: [
    starlight({
      title: 'JHub Apps',
      description: 'JupyterHub Apps Launcher, a generalized server launcher.',
      favicon: '/favicon.ico',
      plugins: [
        nebari({
          // Site root: the logo returns to this site's landing page (works in
          // dev/preview too, unlike an absolute production URL).
          logoHref: '/',
          githubHref: 'https://github.com/nebari-dev/jhub-apps',
        }),
      ],
      components: {
        // Wraps the theme Head to add Google Analytics + the cookie-consent
        // banner and to keep the site's own favicon.ico.
        Head: './src/components/Head.astro',
      },
      customCss: ['./src/styles/custom.css'],
      editLink: {
        // Starlight appends the source path (src/content/docs/<file>) to this
        // base, so it must point at the Astro project root inside the repo.
        baseUrl: 'https://github.com/nebari-dev/jhub-apps/edit/main/docs/',
      },
      sidebar: [
        { label: 'Introduction', link: '/intro/' },
        { label: 'Install and setup', link: '/installation/' },
        { label: 'Configuration', link: '/configuration/' },
        { label: 'Branding', link: '/branding/' },
        {
          label: 'Create Apps',
          items: [
            { label: 'General instructions', link: '/create-apps/general-app/' },
            { label: 'Panel apps', link: '/create-apps/panel-app/' },
            { label: 'Gradio apps', link: '/create-apps/gradio-app/' },
            { label: 'Bokeh apps', link: '/create-apps/bokeh-app/' },
            { label: 'Plotly Dash apps', link: '/create-apps/plotly-dash-app/' },
            { label: 'Custom/Generic apps', link: '/create-apps/custom-app/' },
            { label: 'Voila apps', link: '/create-apps/voila-app/' },
            { label: 'Streamlit apps', link: '/create-apps/streamlit-app/' },
          ],
        },
        {
          label: 'Conceptual Overview',
          items: [
            {
              label: 'Infrastructure Architecture',
              link: '/concepts/infrastructure-architecture/',
            },
          ],
        },
      ],
    }),
  ],
});
