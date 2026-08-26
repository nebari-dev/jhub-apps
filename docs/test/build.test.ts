import { test, expect, beforeAll, setDefaultTimeout } from 'bun:test';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { $ } from 'bun';

setDefaultTimeout(180_000);

const SITE = join(import.meta.dir, '..');
const DIST = join(SITE, 'dist');

const TITLES: Record<string, string> = {
  '': 'JHub Apps',
  intro: 'Introduction',
  installation: 'Install and setup',
  configuration: 'Configuration',
  'create-apps/general-app': 'General instructions',
  'create-apps/panel-app': 'Panel apps',
  'create-apps/gradio-app': 'Gradio apps',
  'create-apps/bokeh-app': 'Bokeh apps',
  'create-apps/plotly-dash-app': 'Plotly Dash apps',
  'create-apps/custom-app': 'Custom/Generic app',
  'create-apps/voila-app': 'Voila apps',
  'create-apps/streamlit-app': 'Streamlit apps',
  'concepts/infrastructure-architecture': 'Infrastructure Architecture',
};

function pagePath(slug: string): string {
  return slug === '' ? join(DIST, 'index.html') : join(DIST, slug, 'index.html');
}
function readPage(slug: string): string {
  return readFileSync(pagePath(slug), 'utf8');
}

beforeAll(async () => {
  await $`bun run build`.cwd(SITE);
});

test('all pages render with their titles', () => {
  for (const [slug, title] of Object.entries(TITLES)) {
    expect(existsSync(pagePath(slug))).toBe(true);
    expect(readPage(slug)).toContain(title);
  }
});

test('sidebar links all resolve to built pages', () => {
  const html = readPage('intro');
  expect(html).toContain('Create Apps');
  expect(html).toContain('Conceptual Overview');
  for (const slug of Object.keys(TITLES)) {
    if (slug === '') continue; // the splash page is not in the sidebar
    expect(html).toContain(`href="/${slug}/"`);
  }
});

test('every internal href and image on every page resolves', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name);
      return e.isDirectory() ? walk(p) : e.name.endsWith('.html') ? [p] : [];
    });
  for (const file of walk(DIST)) {
    const content = readFileSync(file, 'utf8');
    for (const m of content.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)) {
      const path = m[1];
      if (path.startsWith('//')) continue; // protocol-relative external URL
      if (path.includes('.')) {
        // Asset reference (image, favicon, script): the file must exist.
        expect(existsSync(join(DIST, path))).toBe(true);
      } else {
        expect(existsSync(pagePath(path.replace(/^\/|\/$/g, '')))).toBe(true);
      }
    }
  }
});
