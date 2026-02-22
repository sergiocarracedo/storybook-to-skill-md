---
title: LLM Providers
description: Supported LLM providers and how to configure them
---

`storybook-to-skills-md` supports three LLM providers: OpenAI, Anthropic, and Google AI. Each provider offers different models with varying capabilities and pricing.

## Supported Providers

### OpenAI

**Recommended Models:**
- `gpt-4o` - Latest GPT-4 optimized model (best balance of speed and quality)
- `gpt-4-turbo` - High-quality output, slower than gpt-4o
- `gpt-3.5-turbo` - Faster and cheaper, lower quality

**Setup:**
```bash
export SKILLGEN_PROVIDER=openai
export SKILLGEN_MODEL=gpt-4o
export SKILLGEN_API_KEY=sk-...
```

**Get API Key:** [OpenAI Platform](https://platform.openai.com/api-keys)

### Anthropic

**Recommended Models:**
- `claude-3-5-sonnet-20241022` - Latest Claude 3.5 Sonnet (excellent for technical docs)
- `claude-3-opus-20240229` - Highest quality, slower
- `claude-3-haiku-20240307` - Fastest, good for iteration

**Setup:**
```bash
export SKILLGEN_PROVIDER=anthropic
export SKILLGEN_MODEL=claude-3-5-sonnet-20241022
export SKILLGEN_API_KEY=sk-ant-...
```

**Get API Key:** [Anthropic Console](https://console.anthropic.com/)

### Google AI

**Recommended Models:**
- `gemini-2.0-flash-exp` - Latest experimental model (fast and capable)
- `gemini-1.5-pro` - High-quality production model
- `gemini-1.5-flash` - Faster, good for iteration

**Setup:**
```bash
export SKILLGEN_PROVIDER=google
export SKILLGEN_MODEL=gemini-2.0-flash-exp
export SKILLGEN_API_KEY=...
```

**Get API Key:** [Google AI Studio](https://makersuite.google.com/app/apikey)

## Choosing a Provider

Consider these factors:

### Quality
- **Best:** Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro
- **Good:** GPT-4 Turbo, Claude 3 Haiku
- **Fast:** GPT-3.5 Turbo, Gemini 1.5 Flash

### Speed
- **Fastest:** Gemini Flash, Claude Haiku, GPT-3.5 Turbo
- **Medium:** GPT-4o, Gemini 2.0 Flash
- **Slower:** Claude Opus, GPT-4 Turbo

### Cost
- **Cheapest:** GPT-3.5 Turbo, Gemini Flash, Claude Haiku
- **Mid:** GPT-4o, Gemini Pro, Claude Sonnet
- **Premium:** Claude Opus, GPT-4 Turbo

### Recommendations by Use Case

**Production documentation:**
- Use `claude-3-5-sonnet-20241022` or `gpt-4o`
- High quality, reasonable speed and cost

**Rapid iteration/development:**
- Use `gemini-2.0-flash-exp` or `claude-3-haiku-20240307`
- Fast feedback, lower cost

**CI/CD pipelines:**
- Use `gpt-4o` or `gemini-1.5-pro`
- Balance quality and cost for automated generation

## API Key Security

**Never commit API keys to version control!**

### Recommended Approaches

1. **Environment Variables** (local development):
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   export SKILLGEN_API_KEY=sk-...
   ```

2. **`.env` Files** (with `.gitignore`):
   ```bash
   # .env
   SKILLGEN_API_KEY=sk-...
   ```
   
   ```bash
   # .gitignore
   .env
   .env.local
   ```

3. **Secrets Management** (CI/CD):
   - GitHub Actions: Use [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
   - GitLab CI: Use [CI/CD variables](https://docs.gitlab.com/ee/ci/variables/)
   - Other platforms: Use their built-in secrets management

## Rate Limits

All providers have rate limits. If you encounter rate limit errors:

1. **Reduce concurrency:**
   ```bash
   --concurrency 1
   ```

2. **Add retries with backoff:**
   ```bash
   --retries 5
   ```

3. **Increase timeout:**
   ```bash
   --timeout 120000
   ```

## Cost Estimation

Rough cost estimates for generating 50 components:

| Provider | Model | Estimated Cost |
|----------|-------|----------------|
| OpenAI | gpt-4o | $1-2 |
| OpenAI | gpt-3.5-turbo | $0.20-0.40 |
| Anthropic | claude-3-5-sonnet | $2-4 |
| Anthropic | claude-3-haiku | $0.50-1 |
| Google | gemini-1.5-pro | $1-2 |
| Google | gemini-1.5-flash | $0.10-0.20 |

*Actual costs vary based on component complexity and story count.*

## Troubleshooting

See the [Providers Troubleshooting](../reference/troubleshooting#provider-issues) guide for common provider-specific issues.
