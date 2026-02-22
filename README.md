# Storybook to SKILL.md

[![npm version](https://img.shields.io/npm/v/storybook-to-skills-md.svg)](https://www.npmjs.com/package/storybook-to-skills-md)
[![CI Status](https://github.com/sergiocarracedo/storybook-to-skill-md/actions/workflows/ci.yml/badge.svg)](https://github.com/sergiocarracedo/storybook-to-skill-md/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that reads Storybook projects and generates [SKILL.md](https://agentskills.io) files for AI agents using LLMs.

> 📚 **[Full Documentation](https://sergiocarracedo.github.io/storybook-to-skill-md)** | **[CLI Reference](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/commands)** | **[Quick Start](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/quick-start)** | **[Security](./SECURITY.md)**

## Monorepo Structure

This repository contains two packages:

- **[`packages/cli`](./packages/cli/)** - The CLI tool (`storybook-to-skills-md`)
- **[`packages/web`](./packages/web/)** - Documentation website built with Astro + Starlight

## Features

- Fetches component metadata from Storybook's `index.json`
- **Offline mode** - Use local `index.json` from built Storybook (no server needed)
- Extracts props using `react-docgen-typescript`
- Parses story files with `@storybook/csf-tools`
- Extracts documentation from MDX files
- Generates SKILL.md files using AI SDK (OpenAI, Anthropic, Google)
- Caches results to skip unchanged components
- Supports include/exclude patterns for filtering
- Detailed progress output with timing and token estimates
- Customizable timeouts and retries
- Parallel extraction for server-only mode

## Installation

```bash
npm install -g storybook-to-skills-md
# or
pnpm add -g storybook-to-skills-md
# or
yarn global add storybook-to-skills-md
```

## Quick Start

```bash
# Generate SKILL.md files from a deployed Storybook
storybook-to-skills-md generate \
  --storybook-url https://your-storybook.com \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY

# Or use offline mode with local build
npm run build-storybook
storybook-to-skills-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY
```

For detailed usage, see the **[Quick Start Guide](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/quick-start)**.

## CLI Usage

```bash
storybook-to-skills-md generate [options]
```

**Key Options:**
- `-u, --storybook-url <url>` - Storybook URL (OR use `--index-file`)
- `--index-file <path>` - Local index.json path (offline mode)
- `-s, --source-dir <dir>` - Source directory (default: ./src)
- `-o, --output-dir <dir>` - Output directory (default: ./skills)
- `-p, --provider <provider>` - LLM provider: openai, anthropic, google
- `-m, --model <model>` - Model name (e.g., gpt-4o, claude-3-5-sonnet-20241022)
- `-k, --api-key <key>` - API key for the LLM provider
- `-c, --concurrency <number>` - Concurrent requests (default: 3)
- `-v, --verbose` - Enable verbose logging
- `--force` - Regenerate all files (ignore cache)

For all options, see the **[CLI Reference](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/commands)**.

## Configuration

Create a `.skillgenrc.json` in your project root:

```json
{
  "storybookUrl": "https://your-storybook.com",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "include": ["Components/**"],
  "exclude": ["**/Internal/**"],
  "concurrency": 3
}
```

**Environment Variables:**

```bash
SKILLGEN_STORYBOOK_URL=https://your-storybook.com
SKILLGEN_PROVIDER=openai
SKILLGEN_MODEL=gpt-4o
SKILLGEN_API_KEY=sk-...
```

For full configuration options, see the **[Configuration Guide](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/configuration)**.

## Programmatic Usage

```typescript
import { generate, loadConfig } from 'storybook-to-skills-md';

const config = await loadConfig({
  storybookUrl: 'https://your-storybook.com',
  sourceDir: './src/components',
  outputDir: './skills',
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
});

const results = await generate(config);

console.log(`Generated ${results.filter(r => r.status === 'generated').length} files`);
```

## Output Structure

```
skills/
├── button/
│   ├── SKILL.md
│   └── .skill-meta.json
├── data-collection/
│   ├── SKILL.md
│   └── .skill-meta.json
└── ...
```

### SKILL.md Format

Generated files follow the [agentskills.io](https://agentskills.io) specification:

```markdown
---
name: button
description: Use this button component when you need interactive clickable elements...
---

# Button

A reusable button component...

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' | 'primary' | Button style |

## Usage Examples

...
```

## Caching

The tool caches file hashes in `.skill-meta.json` to skip regeneration when source files haven't changed. Use `--force` to regenerate all files.

## Supported Providers

| Provider | Models |
|----------|--------|
| OpenAI | gpt-4o, gpt-4-turbo, gpt-3.5-turbo |
| Anthropic | claude-3-5-sonnet, claude-3-opus, claude-3-haiku |
| Google | gemini-2.0-flash, gemini-1.5-pro |

## Requirements

- Node.js 20+
- A deployed Storybook OR a local build with `index.json`
- API key for your chosen LLM provider

## GitHub Action

Automate SKILL.md generation in your CI/CD pipeline with the official GitHub Action:

```yaml
- name: Generate SKILL.md files
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    source-dir: './src/components'
    output-dir: './skills'
    provider: 'openai'
    model: 'gpt-4o'
  env:
    API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

See the [GitHub Action repository](https://github.com/sergiocarracedo/storybook-to-skill-md-action) for more examples and documentation.

## Documentation

Full documentation is available at **https://sergiocarracedo.github.io/storybook-to-skill-md**:

- **[Getting Started](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/installation)** - Installation and quick start
- **[CLI Reference](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/commands)** - All CLI commands and options
- **[Configuration](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/configuration)** - Config files, env vars, and best practices
- **[LLM Providers](https://sergiocarracedo.github.io/storybook-to-skill-md/providers/overview)** - OpenAI, Anthropic, Google setup
- **[GitHub Action](https://sergiocarracedo.github.io/storybook-to-skill-md/guides/github-action)** - CI/CD integration guide
- **[Troubleshooting](https://sergiocarracedo.github.io/storybook-to-skill-md/reference/troubleshooting)** - Common issues and solutions

## Development

This is a monorepo managed with pnpm workspaces.

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Build specific package
pnpm --filter "storybook-to-skills-md" build
pnpm --filter web build

# Run CLI in development
cd packages/cli
pnpm dev generate --storybook-url https://example.com

# Run tests
pnpm --filter "storybook-to-skills-md" test

# Type check
pnpm --filter "storybook-to-skills-md" typecheck

# Lint & format
pnpm --filter "storybook-to-skills-md" lint
pnpm --filter "storybook-to-skills-md" fmt

# Run web dev server
pnpm --filter web dev

# Secret scanning
pnpm secrets:detect        # Scan entire repo
pnpm secrets:protect       # Scan staged files only
```

## Security

This project uses **Gitleaks** to prevent secrets (API keys, tokens) from being committed. 

- **Pre-commit hook**: Scans staged files automatically
- **Pre-push hook**: Full repository scan before push
- **CI/CD**: Automated scanning on every push/PR

See [SECURITY.md](./SECURITY.md) for details.

## License

MIT
