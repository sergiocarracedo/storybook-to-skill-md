---
title: Installation
description: Install storybook-to-skills-md CLI tool
---

## Installation

Install the CLI globally using your preferred package manager:

```bash
# Using npm
npm install -g @sergiocarracedo/storybook-to-skills-md

# Using pnpm
pnpm add -g @sergiocarracedo/storybook-to-skills-md

# Using yarn
yarn global add @sergiocarracedo/storybook-to-skills-md
```

## Prerequisites

Before using the tool, ensure you have:

- **Node.js 20 or later** - Required to run the CLI
- **A Storybook project** - With accessible `index.json` file
- **LLM API key** - For OpenAI, Anthropic, or Google AI

## Verify Installation

After installation, verify the CLI is working:

```bash
storybook-to-skills-md --version
```

You should see the version number printed to the console.

## Next Steps

- Continue to [Quick Start](./quick-start) to generate your first SKILL.md files
- Learn about [configuration options](../cli/configuration)
- Explore [LLM providers](../providers/overview)
