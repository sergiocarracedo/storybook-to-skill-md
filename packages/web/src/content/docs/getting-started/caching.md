---
title: Caching
description: Understand how storybook-to-skill-md caches generated files
---

storybook-to-skill-md caches generated SKILL.md files to avoid regenerating unchanged components.

## How It Works

After generating SKILL.md files, the tool creates a `.skill-meta.json` file in each component folder:

```json
{
  "componentId": "button--default",
  "hash": "a1b2c3d4e5f6...",
  "model": "claude-sonnet-4-6",
  "generatedAt": "2024-01-15T10:30:00Z",
  "sourceFiles": [
    "./src/components/Button.tsx",
    "./src/components/Button.stories.tsx"
  ]
}
```

On subsequent runs:

1. Tool computes a hash of your source files
2. Compares with stored hash in `.skill-meta.json`
3. Only regenerates files where the hash changed

## Force Regeneration

To ignore cache and regenerate all files:

```bash
--force
```

This is useful when:
- You changed the prompt template
- You want to use a different model
- You're debugging generation issues

## Cache Location

Each component folder contains:

```
skills/
├── button/
│   ├── SKILL.md           # Generated documentation
│   └── .skill-meta.json   # Cache metadata
└── input/
    ├── SKILL.md
    └── .skill-meta.json
```

## CI/CD Tips

In CI/CD pipelines, using cache:

- Reduces API costs (fewer LLM calls)
- Speeds up generation (skips unchanged components)
- Provides consistent output for unchanged files

The cache is local to each run. For CI/CD:
- Commit `.skill-meta.json` files to persist cache across runs
- Or use `--force` to always regenerate fresh

## Disable Caching

There's no option to disable caching. Use `--force` if you need to regenerate everything.
