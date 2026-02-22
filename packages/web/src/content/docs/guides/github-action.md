---
title: GitHub Action
description: Automate SKILL.md generation in your CI/CD pipeline with the official GitHub Action
---

import { Card, CardGrid } from '@astrojs/starlight/components';

You have two options to integrate `storybook-to-skills-md` into your GitHub Actions:

<CardGrid>
	<Card title="Use the GitHub Action (Recommended)" icon="rocket">
		Use our official GitHub Action for the easiest setup:
		
		```yaml
		- name: Generate SKILL.md
		  uses: sergiocarracedo/storybook-to-skill-md-action@v1
		```
		
		[View on GitHub →](https://github.com/sergiocarracedo/storybook-to-skill-md-action)
	</Card>
	<Card title="Use CLI Directly" icon="setting">
		Install and run the CLI directly in your workflow:
		
		```yaml
		- name: Install CLI
		  run: npm install -g storybook-to-skills-md
		```
		
		More control, requires more setup.
	</Card>
</CardGrid>

---

## Option 1: Using the GitHub Action (Recommended)

The easiest way to integrate is using our official GitHub Action:

```yaml
name: Generate SKILL.md Files

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

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

      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Action'
          git config --global user.email 'action@github.com'
          git add skills/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update SKILL.md files [skip ci]" && git push)
```

### Action Inputs

| Input | Required | Description | Default |
|-------|----------|-------------|---------|
| `storybook-url` | No* | Storybook URL | - |
| `index-file` | No* | Path to local index.json | - |
| `source-dir` | No | Source directory | `./src` |
| `output-dir` | No | Output directory | `./skills` |
| `provider` | Yes | LLM provider: `openai`, `anthropic`, `google` | - |
| `model` | Yes | Model name | - |
| `api-key` | No | API key (use `api-key` input or `API_KEY` env var) | - |
| `concurrency` | No | Concurrent requests | `3` |
| `include` | No | Include patterns (comma-separated) | - |
| `exclude` | No | Exclude patterns (comma-separated) | - |
| `verbose` | No | Enable verbose logging | `false` |

*Either `storybook-url` or `index-file` is required.

### Action Outputs

| Output | Description |
|--------|-------------|
| `changed` | Whether files were changed (`true`/`false`) |
| `count` | Number of files generated |

### Using Environment Variable for API Key

```yaml
- name: Generate SKILL.md
  uses: sergiocarracedo/storybook-to-skill-md-action@v1
  with:
    storybook-url: 'https://your-storybook.com'
    provider: 'openai'
    model: 'gpt-4o'
  env:
    API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## Option 2: Using CLI Directly

If you need more control, you can install and run the CLI directly:

```yaml
name: Generate SKILL.md Files

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build Storybook
        run: npm run build-storybook

      - name: Install CLI
        run: npm install -g storybook-to-skills-md

      - name: Generate SKILL.md files
        run: |
          storybook-to-skills-md generate \
            --index-file ./storybook-static/index.json \
            --source-dir ./src/components \
            --output-dir ./skills \
            --provider openai \
            --model gpt-4o \
            --api-key ${{ secrets.OPENAI_API_KEY }}

      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Action'
          git config --global user.email 'action@github.com'
          git add skills/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update SKILL.md files [skip ci]" && git push)
```

## Store API Keys Securely

1. Go to your repository **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add your API key:
   - **Name:** `OPENAI_API_KEY` (or `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`)
   - **Secret:** Your actual API key

## Advanced Workflows

### Generate on Release

Only generate SKILL.md files when creating a new release:

```yaml
name: Generate SKILL.md on Release

on:
  release:
    types: [published]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      # ... same steps as basic setup ...
      
      - name: Generate SKILL.md files
        run: |
          storybook-to-skills-md generate \
            --index-file ./storybook-static/index.json \
            --source-dir ./src/components \
            --output-dir ./skills \
            --provider anthropic \
            --model claude-3-5-sonnet-20241022 \
            --api-key ${{ secrets.ANTHROPIC_API_KEY }} \
            --force
```

### Upload as Artifact

Upload generated files as workflow artifacts:

```yaml
      - name: Generate SKILL.md files
        run: |
          storybook-to-skills-md generate \
            --index-file ./storybook-static/index.json \
            --source-dir ./src \
            --output-dir ./skills \
            --provider openai \
            --model gpt-4o \
            --api-key ${{ secrets.OPENAI_API_KEY }}

      - name: Upload SKILL.md artifacts
        uses: actions/upload-artifact@v4
        with:
          name: skill-files
          path: skills/
```

### Deploy Storybook + Generate Skills

Combine Storybook deployment with SKILL.md generation:

```yaml
name: Deploy Storybook & Generate Skills

on:
  push:
    branches: [main]

jobs:
  deploy-and-generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run build-storybook
      
      # Deploy to Chromatic, Vercel, etc.
      - name: Deploy Storybook
        run: npx chromatic --project-token=${{ secrets.CHROMATIC_TOKEN }}
      
      # Generate SKILL.md from deployed URL
      - name: Generate SKILL.md files
        run: |
          npm install -g storybook-to-skills-md
          storybook-to-skills-md generate \
            --storybook-url https://your-deployed-storybook.com \
            --source-dir ./src/components \
            --output-dir ./skills \
            --provider openai \
            --model gpt-4o \
            --api-key ${{ secrets.OPENAI_API_KEY }}
      
      - name: Commit skills
        run: |
          git config user.name 'GitHub Action'
          git config user.email 'action@github.com'
          git add skills/
          git diff --quiet && git diff --staged --quiet || \
            (git commit -m "chore: update SKILL.md [skip ci]" && git push)
```

### Matrix Strategy (Multiple Providers)

Generate with multiple LLM providers for comparison:

```yaml
jobs:
  generate:
    strategy:
      matrix:
        provider: [openai, anthropic, google]
        include:
          - provider: openai
            model: gpt-4o
            secret: OPENAI_API_KEY
          - provider: anthropic
            model: claude-3-5-sonnet-20241022
            secret: ANTHROPIC_API_KEY
          - provider: google
            model: gemini-2.0-flash-exp
            secret: GOOGLE_API_KEY
    
    runs-on: ubuntu-latest
    steps:
      # ... setup steps ...
      
      - name: Generate with ${{ matrix.provider }}
        run: |
          storybook-to-skills-md generate \
            --index-file ./storybook-static/index.json \
            --source-dir ./src \
            --output-dir ./skills-${{ matrix.provider }} \
            --provider ${{ matrix.provider }} \
            --model ${{ matrix.model }} \
            --api-key ${{ secrets[matrix.secret] }}
```

## Configuration with .skillgenrc.json

Use a config file to simplify the workflow:

**`.skillgenrc.json`:**
```json
{
  "indexFile": "./storybook-static/index.json",
  "sourceDir": "./src/components",
  "outputDir": "./skills",
  "provider": "openai",
  "model": "gpt-4o",
  "concurrency": 5,
  "include": ["Components/**"],
  "exclude": ["**/Internal/**"]
}
```

**Workflow:**
```yaml
      - name: Generate SKILL.md files
        run: |
          npm install -g storybook-to-skills-md
          storybook-to-skills-md generate \
            --api-key ${{ secrets.OPENAI_API_KEY }}
```

## Best Practices

1. **Use `[skip ci]` in commit messages** - Prevent infinite loops
2. **Cache dependencies** - Speed up workflow with `actions/cache`
3. **Use `--force` on releases** - Ensure all files are regenerated
4. **Monitor costs** - Set concurrency limits to control API usage
5. **Test in PR** - Generate in PRs but only commit on main branch

## Troubleshooting

### Files not committing

Make sure the bot has write permissions:

```yaml
permissions:
  contents: write
```

### API rate limits

Reduce concurrency:

```yaml
--concurrency 2
```

### Workflow timeout

Increase timeout or reduce scope:

```yaml
jobs:
  generate:
    timeout-minutes: 30  # Default is 360 (6 hours)
```

## Related

- [CLI Commands](../cli/commands)
- [Configuration](../cli/configuration)
- [Troubleshooting](../reference/troubleshooting)
