# storybook-to-skill-md

[![npm version](https://img.shields.io/npm/v/storybook-to-skill-md.svg)](https://www.npmjs.com/package/storybook-to-skill-md)
[![CI Status](https://github.com/sergiocarracedo/storybook-to-skill-md/actions/workflows/ci.yml/badge.svg)](https://github.com/sergiocarracedo/storybook-to-skill-md/actions)
[![npm downloads](https://img.shields.io/npm/dm/storybook-to-skill-md)](https://www.npmjs.com/package/storybook-to-skill-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that reads Storybook projects and generates [SKILL.md](https://agentskills.io) files for AI agents using LLMs.

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
npm install -g storybook-to-skill-md
# or
pnpm add -g storybook-to-skill-md
```

## Quick Start

```bash
# Generate SKILL.md files from a deployed Storybook
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --source-dir ./src \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY

# Or use offline mode with local build
npm run build-storybook
storybook-to-skill-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY
```

## CLI Usage

```bash
storybook-to-skill-md generate [options]

Options:
  -u, --storybook-url <url>     Storybook URL (required)
  -s, --source-dir <dir>        Source directory (default: ./src)
  -o, --output-dir <dir>        Output directory (default: ./skills)
  -p, --provider <provider>     LLM provider: openai, anthropic, google (default: openai)
  -m, --model <model>           LLM model name (default: gpt-4o)
  -k, --api-key <key>           API key for the LLM provider
  -i, --include <patterns...>   Glob patterns to include
  -e, --exclude <patterns...>   Glob patterns to exclude
  -c, --concurrency <number>    Concurrent LLM requests (default: 3)
  --config <path>               Path to config file
  -v, --verbose                 Enable verbose logging
  --dry-run                     Show what would be generated
  --force                       Regenerate all files
```

## Configuration

Create a `skillgen.config.json` or `skillgen.config.ts` in your project root:

```json
{
  "storybookUrl": "https://your-storybook.com",
  "sourceDir": "./src",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "include": ["Components/**"],
  "exclude": ["**/Internal/**"],
  "concurrency": 3
}
```

### Environment Variables

```bash
SKILLGEN_STORYBOOK_URL=https://your-storybook.com
SKILLGEN_PROVIDER=openai
SKILLGEN_MODEL=gpt-4o
SKILLGEN_API_KEY=sk-...
```

## Programmatic Usage

```typescript
import { generate, loadConfig } from 'storybook-to-skill-md';

const config = await loadConfig({
  storybookUrl: 'https://your-storybook.com',
  sourceDir: './src',
  outputDir: './skills',
  provider: 'openai',
  model: 'gpt-4o',
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

Automate SKILL.md generation in your CI/CD pipeline:

```yaml
- name: Generate SKILL.md files
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    source-dir: './src'
    output-dir: './skills'
    provider: 'openai'
    model: 'gpt-4o'
    api-key: ${{ secrets.OPENAI_API_KEY }}
```

See [GitHub Action Repository](https://github.com/sergiocarracedo/storybook-to-skill-md-action) for more examples.

## Documentation

See the [docs](./docs/) folder for detailed documentation:

- [Getting Started](./docs/getting-started.md)
- [CLI Reference](./docs/cli-reference.md)
- [Configuration](./docs/configuration.md)
- [Use Cases](./docs/use-cases.md)

## Development

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev generate --storybook-url https://example.com

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format
pnpm fmt
```

## License

MIT
