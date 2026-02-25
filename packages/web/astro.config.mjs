// @ts-check
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

const repoName = process.env.BASE_PATH || process.env.PUBLIC_BASE_PATH || 'storybook-to-skill-md';
const basePath = repoName.startsWith('/') ? repoName : `/${repoName}`;
const siteUrl = (process.env.SITE_URL || process.env.PUBLIC_SITE_URL || 'https://sergiocarracedo.github.io') + basePath;

const sidebarConfig = [
  {
    label: 'Getting Started',
    items: [
      { label: 'Installation', slug: 'getting-started/installation' },
      { label: 'Quick Start', slug: 'getting-started/quick-start' },
      { label: 'Caching', slug: 'getting-started/caching' },
      { label: 'GitHub Action', slug: 'getting-started/github-action' },
    ],
  },
  {
    label: 'CLI',
    items: [
      { label: 'Commands', slug: 'cli/commands' },
      { label: 'Configuration', slug: 'cli/configuration' },
    ],
  },
  {
    label: 'Providers',
    items: [
      { label: 'Overview', slug: 'providers/overview' },
    ],
  },
  {
    label: 'Reference',
    items: [
      { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
    ],
  },
];

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  base: basePath,
  
  integrations: [
    starlight({
      title: 'Storybook to SKILL.md',
      description: 'Generate AI-ready component SKILL.md from Storybook',
      logo: {
        src: './src/assets/logo.svg',
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/sergiocarracedo/storybook-to-skill-md',
        },
      ],
      sidebar: sidebarConfig,
      customCss: [
        './src/styles/custom.css',
      ],
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: `${basePath}/favicon.ico`, sizes: '48x48' } },
        { tag: 'link', attrs: { rel: 'icon', href: `${basePath}/favicon.svg`, type: 'image/svg+xml' } },
        { tag: 'link', attrs: { rel: 'apple-touch-icon', href: `${basePath}/apple-touch-icon.png` } },
        { tag: 'link', attrs: { rel: 'manifest', href: `${basePath}/site.webmanifest` } },
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});