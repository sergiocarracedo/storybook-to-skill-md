---
title: CLI Commands
description: Complete reference for all storybook-to-skills-md commands
---

## Command: `generate`

Generate SKILL.md files from a Storybook project.

```bash
storybook-to-skills-md generate [options]
```

## Index Source Options

**Either `--storybook-url` OR `--index-file` is required.**

### `--storybook-url <url>` / `-u <url>`
- **Description:** URL of deployed Storybook
- **Example:** `--storybook-url https://design-system.example.com`
- **Env:** `SKILLGEN_STORYBOOK_URL`

### `--index-file <path>`
- **Description:** Path to local `index.json` file (offline mode)
- **Example:** `--index-file ./storybook-static/index.json`
- **Env:** `SKILLGEN_INDEX_FILE`

## Directory Options

### `--source-dir <dir>` / `-s <dir>`
- **Description:** Source directory containing component files
- **Default:** `./src`
- **Example:** `--source-dir ./src/components`
- **Env:** `SKILLGEN_SOURCE_DIR`

### `--output-dir <dir>` / `-o <dir>`
- **Description:** Output directory for SKILL.md files
- **Default:** `./skills`
- **Example:** `--output-dir ./docs/skills`
- **Env:** `SKILLGEN_OUTPUT_DIR`

## LLM Provider Options

### `--provider <provider>` / `-p <provider>` (required)
- **Description:** LLM provider to use
- **Choices:** `openai`, `anthropic`, `google`
- **Example:** `--provider anthropic`
- **Env:** `SKILLGEN_PROVIDER`

### `--model <model>` / `-m <model>` (required)
- **Description:** Model name
- **Examples:**
  - OpenAI: `gpt-5.2`, `gpt-5.1`, `gpt-5.1-mini`
  - Anthropic: `claude-sonnet-4-6`, `claude-opus-4-6`, `claude-haiku-4-5`
  - Google: `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.0-flash`
- **Env:** `SKILLGEN_MODEL`

### `--api-key <key>` / `-k <key>` (required)
- **Description:** API key for the LLM provider
- **Example:** `--api-key sk-...`
- **Env:** `SKILLGEN_API_KEY`

## Filtering Options

### `--include <patterns...>` / `-i <patterns...>`
- **Description:** Glob patterns to include (matched against component title)
- **Example:** `--include "Components/**" "UI/**"`
- **Env:** Not supported (use config file)

### `--exclude <patterns...>` / `-e <patterns...>`
- **Description:** Glob patterns to exclude
- **Example:** `--exclude "**/Internal/**" "**/Deprecated/**"`
- **Env:** Not supported (use config file)

## Performance Options

### `--concurrency <number>` / `-c <number>`
- **Description:** Number of concurrent LLM requests
- **Default:** `3`
- **Range:** `1-10`
- **Example:** `--concurrency 5`
- **Env:** `SKILLGEN_CONCURRENCY`

### `--timeout <ms>`
- **Description:** Timeout for LLM calls in milliseconds
- **Default:** `60000` (60 seconds)
- **Example:** `--timeout 120000`
- **Env:** `SKILLGEN_TIMEOUT`

### `--retries <number>`
- **Description:** Number of retries for failed LLM calls
- **Default:** `2`
- **Range:** `0-10`
- **Example:** `--retries 3`
- **Env:** `SKILLGEN_RETRIES`

### `--fetch-retries <number>`
- **Description:** Number of retries for fetching Storybook index
- **Default:** `3`
- **Range:** `1-10`
- **Example:** `--fetch-retries 5`
- **Env:** `SKILLGEN_FETCH_RETRIES`

### `--extraction-concurrency <number>`
- **Description:** Number of concurrent extractions (server-only mode)
- **Default:** `3`
- **Range:** `1-10`
- **Example:** `--extraction-concurrency 5`
- **Env:** `SKILLGEN_EXTRACTION_CONCURRENCY`
- **Note:** Only applies to server-only mode (browser extraction)

## Advanced Options

### `--config <path>`
- **Description:** Path to configuration file
- **Example:** `--config ./config/skillgen.json`

### `--prompt-file <path>`
- **Description:** Path to custom system prompt file
- **Example:** `--prompt-file ./prompts/custom.md`
- **Env:** `SKILLGEN_PROMPT_FILE`

### `--log-prompts <path>`
- **Description:** Save prompts and extracted data for debugging
- **Example:** `--log-prompts ./debug-logs`
- **Env:** Not supported

## Behavior Flags

### `--verbose` / `-v`
- **Description:** Enable verbose logging
- **Default:** `false`
- **Env:** `SKILLGEN_VERBOSE=true`

### `--dry-run`
- **Description:** Show what would be generated without making changes
- **Default:** `false`

### `--force`
- **Description:** Force regeneration of all files (ignore cache)
- **Default:** `false`

### `--server-only`
- **Description:** Extract metadata from Storybook server only (no local source files)
- **Default:** `false` (uses local files if `--source-dir` provided)

### `--no-index-skill`
- **Description:** Skip generating the index `SKILL.md` file. By default, an index is generated at `{outputDir}/_index/SKILL.md` listing all processed components with descriptions and links.
- **Default:** Index generation is enabled

### `--index-skill-template <path>`
- **Description:** Path to a custom template file used as the header/preamble of the index `SKILL.md`. The component list is always appended after the template content, so the template should contain the frontmatter and any introductory text you want.
- **Example:** `--index-skill-template ./templates/index-skill.md`
- **Default:** Built-in template with `name: _index` frontmatter and an overview paragraph

## Examples

### Minimal Command
```bash
storybook-to-skills-md generate \
  -u https://storybook.example.com \
  -p openai \
  -m gpt-4o \
  -k $OPENAI_API_KEY
```

### Production Use
```bash
storybook-to-skills-md generate \
  --index-file ./storybook-static/index.json \
  --source-dir ./src \
  --output-dir ./skills \
  --provider anthropic \
  --model claude-3-5-sonnet-20241022 \
  --api-key $ANTHROPIC_API_KEY \
  --concurrency 5 \
  --timeout 120000 \
  --include "Components/**" "Patterns/**" \
  --exclude "**/Internal/**" \
  --verbose
```

### Debug Mode
```bash
storybook-to-skills-md generate \
  -u https://storybook.example.com \
  -p openai \
  -m gpt-4o \
  -k $OPENAI_API_KEY \
  --dry-run \
  --verbose \
  --log-prompts ./debug
```
