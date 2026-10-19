// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import auth from 'auth-astro';

// The dev server needs a dependency cache of its own: `astro check` and `astro build`
// re-optimize node_modules/.vite and drop the pre-bundled deps they do not need (the
// `motion` bundle, for one). The dev server keeps serving the old hash, the browser
// gets a 504, and the client scripts of that dependency die without a trace — the
// login page's rotating text stops animating.
const cacheDir =
  process.env.ASTRO_VITE_CACHE ??
  (process.argv.includes('dev') ? 'node_modules/.vite-dev' : 'node_modules/.vite');

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [auth()],
  vite: {
    plugins: [tailwindcss()],
    cacheDir,
  }
});
