---
title: Quick Start
description: Generate your first SKILL.md files in minutes
---

This guide will walk you through generating your first SKILL.md files from a Storybook project.

## Basic Usage

### 1. Using a Deployed Storybook URL

If you have a publicly accessible Storybook deployment:

```bash
storybook-to-skills-md generate \
  --storybook-url https://your-storybook.com \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider openai \
  --model gpt-4o \
  --api-key sk-your-api-key
```

### 2. Offline Mode (Local Build)

For working with a local Storybook build:

```bash
# First, build your Storybook
npm run build-storybook

# Then generate from the local index.json
storybook-to-skills-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src/components \
  --output-dir ./skills \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  --api-key $ANTHROPIC_API_KEY
```

### 3. Using Environment Variables

Simplify commands by setting environment variables:

```bash
# Set environment variables
export SKILLGEN_STORYBOOK_URL=https://your-storybook.com
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-4o
export SKILLGEN_API_KEY=sk-your-api-key

# Run with minimal flags
storybook-to-skills-md generate \
  --source-dir ./src/components \
  --output-dir ./skills
```

### 4. Using a Configuration File

For the cleanest setup, create `.skillgenrc.json` in your project root:

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

Then simply run:

```bash
storybook-to-skills-md generate --api-key sk-your-api-key
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
- Component description and purpose
- Props/API documentation
- Usage examples from your Storybook stories
- Implementation guidelines
- Links to your Storybook stories

## Next Steps

- Explore all [CLI commands and options](../cli/commands)
- Learn about [configuration options](../cli/configuration)
- Set up different [LLM providers](../providers/overview)
- Integrate with [GitHub Actions](../guides/github-action) for CI/CD
