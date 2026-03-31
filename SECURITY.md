# Security Policy

## Reporting a Vulnerability

1. **Do NOT open a public issue** for security vulnerabilities
2. Open a [GitHub Security Advisory](https://github.com/AgriciDaniel/claude-video/security/advisories/new)
3. Or contact: support@rankenstein.pro

## Response Timeline

- **Acknowledgment**: Within 72 hours
- **Status update**: Within 7 days
- **Resolution**: Within 30 days for confirmed vulnerabilities

## Supported Versions

Only the latest release receives security updates.

## Security Practices

- **No credentials in repository**: API keys, tokens, and secrets are never committed
- **User-space installation**: Install scripts write only to `~/.claude/` directories
- **Isolated dependencies**: Python packages install in skill-specific virtual environments
- **No network calls at install**: The installer copies files locally; no external API calls
- **Input validation**: All scripts validate file paths and URLs before processing
- **FFmpeg safety**: All FFmpeg commands use `-n` (no-overwrite) by default
- **No arbitrary code execution**: Scripts only process media files, never execute user-provided code

## What We Don't Store

- No API keys or tokens
- No user credentials
- No personal data
- No analytics or telemetry
