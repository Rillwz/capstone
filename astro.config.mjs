// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import auth from 'auth-astro';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [auth()],
  vite: {
    plugins: [tailwindcss()],
    // `astro dev`, `astro check` and `astro build` each re-optimize the dependency
    // cache. Sharing one folder lets them delete each other's pre-bundled deps: the
    // dev server then answers 504 for them and client scripts die without a trace
    // (the login page's rotating text stops animating). One cache dir per entry point.
    cacheDir: process.env.ASTRO_VITE_CACHE ?? 'node_modules/.vite',
  }
});
