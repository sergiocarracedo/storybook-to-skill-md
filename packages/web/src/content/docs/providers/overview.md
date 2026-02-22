---
title: LLM Providers
description: Configure storybook-to-skills-md with OpenAI, Anthropic, or Google AI
---

storybook-to-skills-md supports three LLM providers: OpenAI, Anthropic, and Google AI.

## OpenAI

**API Reference:** `openai`

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

```bash
--provider openai --model gpt-5.2 --api-key sk-...
```

**Available Models:**

| Model | Description |
|-------|-------------|
| `gpt-5.2` | Latest GPT-5 model (recommended) |
| `gpt-5.1` | Stable GPT-5 model |
| `gpt-5.1-mini` | Faster, cheaper GPT-5 variant |

## Anthropic

**API Reference:** `anthropic`

Get your API key from [Anthropic Console](https://console.anthropic.com/).

```bash
--provider anthropic --model claude-sonnet-4-6 --api-key sk-ant-...
```

**Available Models:**

| Model | Description |
|-------|-------------|
| `claude-opus-4-6` | Best quality, for complex tasks |
| `claude-sonnet-4-6` | Best balance of speed and quality (recommended) |
| `claude-haiku-4-5` | Fastest model |

## Google AI

**API Reference:** `google`

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

```bash
--provider google --model gemini-2.5-pro --api-key ...
```

**Available Models:**

| Model | Description |
|-------|-------------|
| `gemini-2.5-pro` | Best quality, complex tasks (recommended) |
| `gemini-2.5-flash` | Best price-performance |
| `gemini-2.0-flash` | Stable, reliable |

## API Key Security

Never commit API keys to version control. Use environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=...
```

Or use CI secrets (GitHub Actions → Settings → Secrets and variables → Actions).
