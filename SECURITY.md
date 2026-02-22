# Security Policy

## Secret Scanning

This project uses **Gitleaks** to detect and prevent secrets (API keys, passwords, tokens) from being committed to the repository.

### Installation

#### macOS (Homebrew)
```bash
brew install gitleaks
```

#### Linux
```bash
# Download latest release
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
tar -xzf gitleaks_8.18.2_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

#### Windows (Scoop)
```bash
scoop install gitleaks
```

#### Verify Installation
```bash
gitleaks version
```

**Note:** If Gitleaks is not installed, the git hooks will show a warning but won't block commits. However, CI/CD will still enforce secret scanning.

### Automated Protection

#### Pre-commit Hook
Every time you commit code, Gitleaks scans staged files for secrets:
```bash
git commit -m "your message"
# → Gitleaks will scan staged files automatically
```

If secrets are detected, the commit will be **blocked** and you'll see which files contain secrets.

#### Pre-push Hook
Before pushing to remote, Gitleaks scans the entire repository:
```bash
git push
# → Full repository scan runs before push
```

#### CI/CD Protection
GitHub Actions runs Gitleaks on every push and pull request to `main` branch.

### Manual Secret Detection

#### Scan Entire Repository
```bash
pnpm secrets:detect
```

This scans all files in the repository for secrets.

#### Scan Staged Changes Only
```bash
pnpm secrets:protect
```

This scans only files staged for commit.

### What Gets Detected?

Gitleaks detects common secret patterns including:

- **OpenAI API Keys**: `sk-...`
- **Anthropic API Keys**: `sk-ant-...`
- **Google API Keys**: `AIza...`
- **AWS credentials**
- **GitHub tokens**
- **Private keys**
- **Generic passwords**
- And many more...

### Allowed Patterns

The following are **allowed** (won't trigger alerts):

- Example placeholders: `sk-your-api-key`, `YOUR_API_KEY`, `sk-...`
- Documentation files: `*.md`, `*.example`, `*.sample`
- Environment variable names: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`

See [`.gitleaks.toml`](./.gitleaks.toml) for the full configuration.

### What To Do If Secrets Are Detected

#### 1. Remove the Secret
```bash
# Edit the file and remove the secret
# Replace with environment variable or example placeholder
```

#### 2. Use Environment Variables
```bash
# .env (add to .gitignore)
OPENAI_API_KEY=sk-your-real-key

# In code
const apiKey = process.env.OPENAI_API_KEY
```

#### 3. Use Example Placeholders in Docs
```markdown
# Good ✅
export OPENAI_API_KEY=sk-your-api-key

# Bad ❌
export OPENAI_API_KEY=sk-proj-abc123...
```

### Disabling Secret Scanning

**Not recommended**, but if you need to bypass:

#### Skip Pre-commit Hook
```bash
git commit --no-verify -m "message"
```

#### Skip Pre-push Hook
```bash
git push --no-verify
```

**Warning**: Bypassing hooks may result in CI failures and security vulnerabilities.

### Managing Git Hooks

#### Install Hooks
```bash
pnpm hooks:install
```

#### Uninstall Hooks
```bash
pnpm hooks:uninstall
```

#### View Hook Configuration
See [`lefthook.yml`](./lefthook.yml) for all git hook configurations.

## Reporting a Vulnerability

If you discover a security vulnerability, please email **hi@sergiocarracedo.es** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact

**Do not** open a public GitHub issue for security vulnerabilities.

## Best Practices

1. **Never commit secrets** - Use environment variables or secret management tools
2. **Use `.env` files** - Add them to `.gitignore`
3. **Rotate exposed keys** - If you accidentally commit a secret, rotate it immediately
4. **Review before commit** - Always review `git diff` before committing
5. **Keep dependencies updated** - Run `pnpm update` regularly

## Secret Management Tools

For production environments, consider using:

- **GitHub Secrets** - For GitHub Actions workflows
- **Vercel Environment Variables** - For web deployments
- **AWS Secrets Manager** - For AWS infrastructure
- **HashiCorp Vault** - For enterprise secret management
- **1Password CLI** - For local development

## CI/CD Secrets

Store sensitive values in GitHub repository secrets:

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add your secret (e.g., `OPENAI_API_KEY`)
4. Reference in workflows: `${{ secrets.OPENAI_API_KEY }}`

## Additional Resources

- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
