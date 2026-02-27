# storybook-to-skill-md

[![npm version](https://img.shields.io/npm/v/storybook-to-skill-md.svg)](https://www.npmjs.com/package/storybook-to-skill-md)
[![License: GPLv3](https://img.shields.io/badge/License-GPLv3-yellow.svg)](https://opensource.org/license/gpl-3-0)

A CLI tool that reads Storybook projects and generates [SKILL.md](https://agentskills.io) files for AI agents using LLMs.

> 📚 **[Full Documentation](https://sergiocarracedo.github.io/storybook-to-skill-md/)** | **[GitHub Repository](https://github.com/sergiocarracedo/storybook-to-skill-md)**

## Features

- ✅ Fetches component metadata from Storybook's `index.json`
- ✅ **Offline mode** - Use local `index.json` from built Storybook (no server needed)
- ✅ Extracts props using `react-docgen-typescript`
- ✅ Parses story files with `@storybook/csf-tools`
- ✅ Extracts documentation from MDX files
- ✅ Generates SKILL.md files using AI SDK (OpenAI, Anthropic, Google, Groq)
- ✅ Caches results to skip unchanged components
- ✅ Supports include/exclude patterns for filtering
- ✅ Detailed progress output with timing and token estimates
- ✅ Customizable timeouts and retries
- ✅ Parallel extraction for server-only mode

## Installation

```bash
npm install -g storybook-to-skill-md
# or
pnpm add -g storybook-to-skill-md
# or
yarn global add storybook-to-skill-md
```

## Quick Start

### Using a Deployed Storybook

```bash
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY
```

### Offline Mode (Local Build)

```bash
# Build your Storybook first
npm run build-storybook

# Generate from local index.json
storybook-to-skill-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  --api-key $ANTHROPIC_API_KEY
```

### Using Environment Variables

```bash
export SKILLGEN_STORYBOOK_URL=https://your-storybook.com
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-4o
export SKILLGEN_API_KEY=sk-...

storybook-to-skill-md generate \
  --source-dir ./src/components \
  --output-dir ./skills
```

### Using Configuration File

Create `.skillgenrc.json`:

```json
{
  "storybookUrl": "https://your-storybook.com",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "concurrency": 3,
  "include": ["Components/**"],
  "exclude": ["**/Internal/**"]
}
```

Then run:

```bash
storybook-to-skill-md generate --api-key $OPENAI_API_KEY
```

## CLI Options

```bash
storybook-to-skill-md generate [options]

Index Source (choose one):
  -u, --storybook-url <url>     Storybook URL
  --index-file <path>           Path to local index.json (offline mode)

Directories:
  -s, --source-dir <dir>        Source directory (default: ./src)
  -o, --output-dir <dir>        Output directory (default: ./skills)

LLM Configuration:
  -p, --provider <provider>     LLM provider: openai, anthropic, google (required)
  -m, --model <model>           Model name (required)
  -k, --api-key <key>           API key (required)

Filtering:
  -i, --include <patterns...>   Glob patterns to include
  -e, --exclude <patterns...>   Glob patterns to exclude

Performance:
  -c, --concurrency <number>    Concurrent requests (default: 3)
  --timeout <ms>                Request timeout (default: 60000)
  --retries <number>            Retry attempts (default: 2)

Other:
  --config <path>               Path to config file
  --prompt-file <path>          Custom system prompt
  -v, --verbose                 Verbose logging
  --dry-run                     Show what would be generated
  --force                       Regenerate all files (ignore cache)
  --server-only                 Server-only extraction (no local files)
  --no-index-skill              Skip generating the index SKILL.md
  --index-skill-template <path> Custom template file for the index SKILL.md (list is appended)
```

## Supported LLM Providers

| Provider | Models |
|----------|--------|
| **OpenAI** | `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo` |
| **Anthropic** | `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229`, `claude-3-haiku-20240307` |
| **Google** | `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash` |
| **Groq** | `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`, `moonshotai/kimi-k2-instruct-0905` |

## Output Structure

```
skills/
├── _index/
│   └── SKILL.md          # Index of all component skills (auto-generated)
├── button/
│   ├── SKILL.md          # AI-friendly component documentation
│   └── .skill-meta.json  # Metadata for caching
├── data-collection/
│   ├── SKILL.md
│   ├── actions.md        # Subcomponent reference
│   ├── filters.md        # Subcomponent reference
│   └── .skill-meta.json
└── ...
```

Each `SKILL.md` file follows the [agentskills.io](https://agentskills.io) specification and includes:
- Component description and purpose
- Props/API documentation
- Usage examples from Storybook stories
- Implementation guidelines
- Links to Storybook

## GitHub Action

Automate SKILL.md generation in your CI/CD pipeline:

```yaml
- name: Generate SKILL.md files
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    source-dir: './src/components'
    output-dir: './skills'
    provider: 'openai'
    model: 'gpt-4o'
    api-key: ${{ secrets.OPENAI_API_KEY }}
```

See the [GitHub Action repository](https://github.com/sergiocarracedo/storybook-to-skill-md-action) for more details.

## Documentation

- **[Installation](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/installation)** - Installation and setup
- **[Quick Start](https://sergiocarracedo.github.io/storybook-to-skill-md/getting-started/quick-start)** - Generate your first files
- **[CLI Commands](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/commands)** - Complete CLI reference
- **[Configuration](https://sergiocarracedo.github.io/storybook-to-skill-md/cli/configuration)** - Config files and environment variables
- **[LLM Providers](https://sergiocarracedo.github.io/storybook-to-skill-md/providers/overview)** - Provider setup guides
- **[GitHub Action](https://sergiocarracedo.github.io/storybook-to-skill-md/guides/github-action)** - CI/CD integration
- **[Troubleshooting](https://sergiocarracedo.github.io/storybook-to-skill-md/reference/troubleshooting)** - Common issues and solutions

## Requirements

- Node.js 20 or later
- A Storybook project with accessible `index.json`
- API key for your chosen LLM provider (OpenAI, Anthropic, Google, or Groq)

## Programmatic Usage

```typescript
import { generate, loadConfig } from 'storybook-to-skill-md';

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

## Examples

### Filter by Pattern

```bash
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --include "Components/**" "Patterns/**" \
  --exclude "**/Internal/**" "**/Deprecated/**" \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY
```

### Custom Prompt

```bash
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --prompt-file ./custom-prompt.md \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  --api-key $ANTHROPIC_API_KEY
```

### Debug Mode

```bash
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --verbose \
  --log-prompts ./debug-logs \
  --dry-run \
  --provider openai \
  --model gpt-4o \
  --api-key $OPENAI_API_KEY
```

## Support

- 📖 **[Documentation](https://sergiocarracedo.github.io/storybook-to-skill-md/)**
- 🐛 **[Report Issues](https://github.com/sergiocarracedo/storybook-to-skill-md/issues)**
- 💬 **[Discussions](https://github.com/sergiocarracedo/storybook-to-skill-md/discussions)**

## License

MIT © [Sergio Carracedo](https://github.com/sergiocarracedo)

## Related Projects

- **[storybook-to-skill-md-action](https://github.com/sergiocarracedo/storybook-to-skill-md-action)** - GitHub Action for automated generation
- **[agentskills.io](https://agentskills.io)** - SKILL.md specification

---

**Made with ❤️ for AI-friendly documentation**
