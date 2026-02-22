// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'Storybook to SKILL.md',
      description: 'Generate AI-ready component docs from Storybook',
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
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Quick Start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'CLI Reference',
          items: [
            { label: 'Commands', slug: 'cli/commands' },
            { label: 'Configuration', slug: 'cli/configuration' },
          ],
        },
        {
          label: 'LLM Providers',
          items: [
            { label: 'Overview', slug: 'providers/overview' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'GitHub Action', slug: 'guides/github-action' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Troubleshooting', slug: 'reference/troubleshooting' },
          ],
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});