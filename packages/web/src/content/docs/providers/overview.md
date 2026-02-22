---
title: LLM Providers
description: Configure storybook-to-skills-md with OpenAI, Anthropic, or Google AI
---

storybook-to-skills-md supports three LLM providers: OpenAI, Anthropic, and Google AI.

## OpenAI

**API Reference:** `openai`

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

```bash
--provider openai --model <model> --api-key sk-...
```

## Anthropic

**API Reference:** `anthropic`

Get your API key from [Anthropic Console](https://console.anthropic.com/).

```bash
--provider anthropic --model <model> --api-key sk-ant-...
```

## Google AI

**API Reference:** `google`

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

```bash
--provider google --model <model> --api-key ...
```

## API Key Security

Never commit API keys to version control. Use environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=...
```

Or use CI secrets (GitHub Actions → Settings → Secrets and variables → Actions).
