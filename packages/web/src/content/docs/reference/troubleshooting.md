---
title: Troubleshooting
description: Common issues and solutions
---

## Common Issues

### Index File Not Found

**Error:**
```
Error: Failed to fetch Storybook index: ENOENT: no such file or directory
```

**Solutions:**

1. Build your Storybook first:
   ```bash
   npm run build-storybook
   ```

2. Verify the path to `index.json`:
   ```bash
   ls -la storybook-static/index.json
   ```

3. Use the correct path in the command:
   ```bash
   --index-file ./storybook-static/index.json
   ```

### API Key Issues

**Error:**
```
Error: Invalid API key provided
```

**Solutions:**

1. Verify your API key is set correctly:
   ```bash
   echo $SKILLGEN_API_KEY
   ```

2. Check for extra spaces or newlines:
   ```bash
   export SKILLGEN_API_KEY="sk-..." # Use quotes
   ```

3. Ensure you're using the right key for the right provider:
   - OpenAI: Starts with `sk-`
   - Anthropic: Starts with `sk-ant-`
   - Google: No specific prefix

### Rate Limit Errors

**Error:**
```
Error: Rate limit exceeded (429)
```

**Solutions:**

1. Reduce concurrency:
   ```bash
   --concurrency 1
   ```

2. Add retries with exponential backoff:
   ```bash
   --retries 5
   ```

3. Increase timeout:
   ```bash
   --timeout 120000
   ```

4. Wait a few minutes and try again

### Timeout Errors

**Error:**
```
Error: Request timeout after 60000ms
```

**Solutions:**

1. Increase timeout:
   ```bash
   --timeout 120000  # 2 minutes
   ```

2. Reduce concurrency:
   ```bash
   --concurrency 2
   ```

3. Check your internet connection

### Source Files Not Found

**Error:**
```
Warning: Source file not found for component X
```

**Solutions:**

1. Verify your source directory:
   ```bash
   ls -la src/components
   ```

2. Use the correct source directory:
   ```bash
   --source-dir ./src/components
   ```

3. Use `--server-only` mode if you don't have source files:
   ```bash
   --server-only
   ```

### Empty or Incomplete Output

**Issue:** Generated SKILL.md files are empty or missing information

**Solutions:**

1. Enable verbose logging:
   ```bash
   --verbose
   ```

2. Save debug logs:
   ```bash
   --log-prompts ./debug-logs
   ```

3. Check your Storybook has stories with docs:
   - Visit your Storybook URL
   - Verify stories are visible
   - Check `index.json` contains component metadata

4. Try a different model:
   ```bash
   --model gpt-4o  # or claude-3-5-sonnet-20241022
   ```

### Permission Denied

**Error:**
```
Error: EACCES: permission denied, mkdir './skills'
```

**Solutions:**

1. Check directory permissions:
   ```bash
   ls -la ./
   ```

2. Use a different output directory:
   ```bash
   --output-dir ~/skills
   ```

3. Run with appropriate permissions (avoid `sudo` if possible)

### Network Errors

**Error:**
```
Error: getaddrinfo ENOTFOUND api.openai.com
```

**Solutions:**

1. Check your internet connection
2. Verify DNS is working:
   ```bash
   ping api.openai.com
   ```
3. Check firewall/proxy settings
4. Try a different network

## Provider-Specific Issues

### OpenAI

**"Model not found" error:**
- Verify the model name is correct: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`
- Check you have access to the model (some require special access)

**"Insufficient quota" error:**
- Add credits to your OpenAI account
- Check your [usage page](https://platform.openai.com/usage)

### Anthropic

**"Invalid API key" error:**
- Ensure key starts with `sk-ant-`
- Regenerate key in [Anthropic Console](https://console.anthropic.com/)

**"Overloaded" error:**
- Anthropic's servers are at capacity
- Wait a few minutes and retry
- Use `--retries 5` for automatic retries

### Google AI

**"API key not valid" error:**
- Get a new key from [AI Studio](https://makersuite.google.com/app/apikey)
- Enable the Generative Language API

**"Model not found" error:**
- Verify model name: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`
- Some models are region-specific

## Getting Help

If you can't resolve your issue:

1. **Check existing issues:** [GitHub Issues](https://github.com/sergiocarracedo/storybook-to-skill-md/issues)
2. **Enable debug mode:** Run with `--verbose` and `--log-prompts ./debug`
3. **Create a new issue:** [New Issue](https://github.com/sergiocarracedo/storybook-to-skill-md/issues/new)

Include in your issue:
- CLI version (`storybook-to-skills-md --version`)
- Node version (`node --version`)
- Operating system
- Full command you ran
- Error message and stack trace
- Debug logs (if applicable)

## FAQ

### Q: Can I use multiple providers at once?
A: No, you must choose one provider per run. You can run the tool multiple times with different providers if needed.

### Q: How much does it cost to generate SKILL.md files?
A: Costs vary by provider and model. See [Provider Overview](../providers/overview#cost-estimation) for estimates.

### Q: Do I need to regenerate files every time I change a component?
A: No! The tool uses caching (`.skill-meta.json`) to detect changes. Only modified components are regenerated.

### Q: Can I customize the generated content?
A: Yes! Use `--prompt-file` to provide a custom system prompt. See [Advanced Configuration](../cli/configuration#advanced-options).

### Q: Does this work with Storybook v6?
A: The tool is designed for Storybook v7+. Storybook v6 may work but is not officially supported.

### Q: Can I run this locally without deploying Storybook?
A: Yes! Use `--index-file` to point to a local `storybook-static/index.json` build. See [Offline Mode](../getting-started/quick-start#2-offline-mode-local-build).
