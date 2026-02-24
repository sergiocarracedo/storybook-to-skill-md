# storybook-to-skill-md

CLI tool that reads Storybook projects and generates `SKILL.md` files for AI agents using LLMs.

## Installation

```bash
npm install -g storybook-to-skill-md
```

Or use it directly with `npx`:

```bash
npx storybook-to-skill-md generate --storybook-url https://your-storybook.example.com
```

## Usage

```bash
storybook-to-skill-md generate [options]
```

### Options

| Option | Description |
|---|---|
| `-u, --storybook-url <url>` | Storybook URL (e.g. `https://ds.example.com`) |
| `--index-file <path>` | Path to local `index.json` file (alternative to `--storybook-url`) |
| `-s, --source-dir <dir>` | Source directory containing components (default: `./src`) |
| `-o, --output-dir <dir>` | Output directory for SKILL.md files (default: `./skills`) |
| `-p, --provider <provider>` | LLM provider (`openai`, `anthropic`, `google`) |
| `-m, --model <model>` | LLM model name |
| `-k, --api-key <key>` | API key for the LLM provider |
| `-i, --include <patterns...>` | Glob patterns to include (matched against title) |
| `-e, --exclude <patterns...>` | Glob patterns to exclude (matched against title) |
| `-c, --concurrency <number>` | Number of concurrent LLM requests (default: `3`) |
| `--server-only` | Extract metadata from Storybook server only (no local source files) |
| `--config <path>` | Path to config file |
| `-v, --verbose` | Enable verbose logging |
| `--dry-run` | Show what would be generated without making changes |
| `--force` | Regenerate all files even if unchanged |
| `--prompt-file <path>` | Path to custom system prompt file |
| `--log-prompts <path>` | Save prompts and extracted data to directory for debugging |
| `--timeout <ms>` | Timeout for LLM calls in milliseconds (default: `60000`) |
| `--retries <number>` | Number of retries for failed LLM calls (default: `2`) |
| `--fetch-retries <number>` | Number of retries for fetching Storybook index (default: `3`) |
| `--extraction-concurrency <number>` | Number of concurrent extractions in server-only mode (default: `3`) |

### Extraction modes

**Local Files (default)** — Reads component source code, stories, and MDX documentation directly from your filesystem. Requires `--source-dir` pointing to your components.

**Server-Only** (`--server-only`) — Extracts metadata from a running Storybook instance using a headless browser. Useful when source files are not available locally.

## Configuration

You can use a configuration file instead of CLI arguments. The following file names are supported:

- `skillgen.config.ts`
- `skillgen.config.js`
- `skillgen.config.json`
- `.skillgenrc.json`
- `.skillgenrc.yaml` / `.skillgenrc.yml`
- `.skillgenrc`

Example `skillgen.config.json`:

```json
{
  "storybookUrl": "https://your-storybook.example.com",
  "sourceDir": "./src",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "concurrency": 3
}
```

## Programmatic API

```typescript
import { generate, generateServerOnly, loadConfig } from 'storybook-to-skill-md';

const { config } = await loadConfig({
  storybookUrl: 'https://your-storybook.example.com',
  sourceDir: './src',
  outputDir: './skills',
  provider: 'openai',
  model: 'gpt-4o',
  apiKey: process.env.OPENAI_API_KEY,
});

const results = await generate(config);
```

## License

MIT
