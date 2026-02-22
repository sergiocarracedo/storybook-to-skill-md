---
title: Quick Start
description: Generate your first SKILL.md files in minutes
---

This guide walks you through generating SKILL.md files from a Storybook project.

## Input Options

You need to tell the tool how to access your Storybook. Choose one of these options:

### Option 1: Storybook URL

Use when your Storybook is deployed and accessible via URL.

```bash
--storybook-url https://your-storybook.com
```

**Best for:** Quick testing, public Storybooks  
**Requires:** Storybook accessible via HTTP  
**Speed:** Medium (fetches from URL each time)

### Option 2: Index File (Offline)

Use when you have a built Storybook locally.

```bash
# Build Storybook first
npm run build-storybook

# Generate from local index.json
--index-file ./storybook-static/index.json
```

**Best for:** CI/CD, offline environments, faster runs  
**Requires:** Pre-built Storybook (`npm run build-storybook`)  
**Speed:** Fast (local file)

### Option 3: Source Directory Only

Use when you only have component source files (no Storybook needed).

```bash
--source-dir ./src/components
```

**Best for:** Simple projects, when you don't use Storybook  
**Requires:** Component source files  
**Speed:** Fastest (no Storybook needed)

## Examples

### Minimal Command

```bash
storybook-to-skills-md generate \
  --storybook-url https://your-storybook.com \
  --provider openai \
  --model gpt-5.2 \
  --api-key $OPENAI_API_KEY
```

### Offline (CI/CD)

```bash
npm run build-storybook

storybook-to-skills-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src/components \
  --provider anthropic \
  --model claude-sonnet-4-6 \
  --api-key $ANTHROPIC_API_KEY
```

### With Environment Variables

```bash
export OPENAI_API_KEY=sk-...
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-5.2

storybook-to-skills-md generate \
  --storybook-url https://your-storybook.com
```

## Configuration File

Create `.skillgenrc.json` for reusable config:

```json
{
  "storybookUrl": "https://your-storybook.com",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-5.2"
}
```

Run with just the API key:

```bash
storybook-to-skills-md generate --api-key $OPENAI_API_KEY
```

## Output

The tool creates:

```
skills/
├── button/
│   ├── SKILL.md
│   └── .skill-meta.json   # Cache (see Caching)
├── input/
│   └── SKILL.md
└── ...
```

Each `SKILL.md` includes:
- Component description
- Props/API documentation
- Usage examples
- Storybook links

## Caching

On subsequent runs, the tool only regenerates components that changed. See [Caching](./caching) for details.

Use `--force` to ignore cache and regenerate everything.

## Next Steps

- [CLI Commands](../cli/commands) - All available options
- [Configuration](../cli/configuration) - Config files, env vars
- [Providers](../providers/overview) - OpenAI, Anthropic, Google setup
- [GitHub Action](./github-action) - CI/CD automation
