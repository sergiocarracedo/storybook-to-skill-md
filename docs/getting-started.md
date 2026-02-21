# Getting Started

## Installation

```bash
# Using npm
npm install -g storybook-to-skill-md

# Using pnpm
pnpm add -g storybook-to-skill-md

# Using yarn
yarn global add storybook-to-skill-md
```

## Prerequisites

- Node.js 20 or later
- A Storybook project with accessible `index.json`
- API key for an LLM provider (OpenAI, Anthropic, or Google)

## Quick Start

### 1. Basic Usage (with Storybook URL)

```bash
storybook-to-skill-md generate \
  --storybook-url https://your-storybook.com \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key sk-your-api-key
```

### 2. Offline Mode (with Local Build)

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

### 3. Using Environment Variables

```bash
# Set environment variables
export SKILLGEN_STORYBOOK_URL=https://your-storybook.com
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-4o
export SKILLGEN_API_KEY=sk-your-api-key

# Run with minimal flags
storybook-to-skill-md generate \
  --source-dir ./src/components \
  --output-dir ./skills
```

### 4. Using Configuration File

Create `.skillgenrc.json` in your project root:

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
storybook-to-skill-md generate --api-key sk-your-api-key
```

## What Gets Generated?

The tool creates a folder structure like this:

```
skills/
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

Each `SKILL.md` file includes:
- Component description
- Props/API documentation
- Usage examples
- Implementation guidelines
- Links to Storybook stories

## Next Steps

- Learn about all [CLI options](./cli-reference.md)
- Explore [configuration options](./configuration.md)
- See [real-world use cases](./use-cases.md)
- Set up [GitHub Action](./github-action.md) for CI/CD
