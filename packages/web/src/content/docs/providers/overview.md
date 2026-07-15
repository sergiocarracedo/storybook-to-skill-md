---
title: LLM Providers
description: Configure storybook-to-skill-md with OpenAI, OpenAI-compatible endpoints, Anthropic, Google AI, or Groq
---

storybook-to-skill-md supports OpenAI, OpenAI-compatible endpoints, Anthropic, Google AI, and Groq.

## OpenAI

**API Reference:** `openai`

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys).

```bash
--provider openai --model <model> --api-key sk-...
```

The `openai` provider is for the official OpenAI API. Use `openai-compatible` for custom OpenAI-compatible endpoints.

## OpenAI-Compatible

**API Reference:** `openai-compatible`

Use this provider for custom OpenAI-compatible APIs.

```bash
--provider openai-compatible --model <model> --base-url https://llm.example.com/v1 --api-key ...
```

`--base-url` is required for `openai-compatible` because the provider has no official default endpoint.

## Anthropic

**API Reference:** `anthropic`

Get your API key from [Anthropic Console](https://console.anthropic.com/).

```bash
--provider anthropic --model <model> --api-key sk-ant-...
```

Anthropic can also use `--base-url` for Anthropic-compatible proxy endpoints.

## Google AI

**API Reference:** `google`

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

```bash
--provider google --model <model> --api-key ...
```

## Groq

**API Reference:** `groq`

Get your API key from [Groq Console](https://console.groq.com/keys).

```bash
--provider groq --model <model> --api-key gsk-...
```

Groq provides high-performance inference with models like `llama-3.3-70b-versatile`, `deepseek-r1-distill-llama-70b`, and third-party models like `moonshotai/kimi-k2-instruct-0905`.

## API Key Security

Never commit API keys to version control. Use environment variables:

```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_API_KEY=...
export GROQ_API_KEY=gsk-...
```

Or use CI secrets (GitHub Actions → Settings → Secrets and variables → Actions).
