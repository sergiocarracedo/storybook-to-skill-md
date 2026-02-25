---
title: Configuration
description: Configure storybook-to-skills-md with files, environment variables, or CLI flags
---

There are three ways to configure `storybook-to-skills-md`: configuration files, environment variables, and CLI flags. They are prioritized in that order (CLI flags override everything).

## Configuration File

Create a `.skillgenrc.json` file in your project root:

```json
{
  "storybookUrl": "https://your-storybook.com",
  "indexFile": "./storybook-static/index.json",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "apiKey": "sk-...",
  "concurrency": 3,
  "timeout": 60000,
  "retries": 2,
  "fetchRetries": 3,
  "extractionConcurrency": 3,
  "include": ["Components/**", "Patterns/**"],
  "exclude": ["**/Internal/**", "**/Deprecated/**"],
  "verbose": false,
  "dryRun": false,
  "force": false,
  "serverOnly": false,
  "indexSkill": true,
  "indexSkillTemplate": "./templates/index-skill.md",
  "promptFile": "./prompts/custom.md",
  "logPrompts": "./debug-logs"
}
```

### Custom Config Path

You can specify a custom config file path:

```bash
storybook-to-skills-md generate --config ./config/custom.json
```

## Environment Variables

All configuration options can be set via environment variables with the `SKILLGEN_` prefix:

```bash
export SKILLGEN_STORYBOOK_URL=https://your-storybook.com
export SKILLGEN_INDEX_FILE=./storybook-static/index.json
export SKILLGEN_SOURCE_DIR=./src/components
export SKILLGEN_OUTPUT_DIR=./skills
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-4o
export SKILLGEN_API_KEY=sk-...
export SKILLGEN_CONCURRENCY=3
export SKILLGEN_TIMEOUT=60000
export SKILLGEN_RETRIES=2
export SKILLGEN_FETCH_RETRIES=3
export SKILLGEN_EXTRACTION_CONCURRENCY=3
export SKILLGEN_VERBOSE=true
export SKILLGEN_PROMPT_FILE=./prompts/custom.md
```

**Note:** Array options like `include` and `exclude` are not supported via environment variables. Use a config file for these.

## CLI Flags

CLI flags override both config files and environment variables. See the [Commands](./commands) reference for all available flags.

## Priority Order

Configuration is resolved in this order (later overrides earlier):

1. **Default values** (hardcoded in the tool)
2. **Configuration file** (`.skillgenrc.json` or `--config`)
3. **Environment variables** (`SKILLGEN_*`)
4. **CLI flags** (highest priority)

## Example: Mixed Configuration

You can mix and match approaches. For example:

**`.skillgenrc.json`:**
```json
{
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "concurrency": 3,
  "include": ["Components/**"],
  "exclude": ["**/Internal/**"]
}
```

**Environment:**
```bash
export SKILLGEN_API_KEY=sk-...
```

**Command:**
```bash
storybook-to-skills-md generate --storybook-url https://storybook.example.com
```

This keeps sensitive data (API keys) in environment variables, common settings in the config file, and variable options (like URLs) in CLI flags.

## Best Practices

1. **Store API keys in environment variables** - Never commit them to version control
2. **Use config files for project-specific settings** - Commit `.skillgenrc.json` to your repo
3. **Use CLI flags for one-off overrides** - Great for testing different models or providers
4. **Use `.gitignore`** - Add `.skillgenrc.json` if it contains sensitive data

## Common Configurations

### CI/CD Environment

```json
{
  "indexFile": "./storybook-static/index.json",
  "sourceDir": "./src",
  "outputDir": "./skills",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "concurrency": 5,
  "force": true
}
```

Then use environment variable for API key:
```bash
export SKILLGEN_API_KEY=$ANTHROPIC_API_KEY
```

### Local Development

```json
{
  "storybookUrl": "http://localhost:6006",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "verbose": true,
  "logPrompts": "./debug"
}
```

### Production

```json
{
  "storybookUrl": "https://design-system.example.com",
  "sourceDir": "./packages/components/src",
  "outputDir": "./docs/skills",
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-20241022",
  "concurrency": 5,
  "timeout": 120000,
  "retries": 3,
  "include": ["Components/**", "Patterns/**"],
  "exclude": ["**/Internal/**", "**/Experimental/**"]
}
```
