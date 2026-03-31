# Contributing to Claude Video

## Reporting Bugs

Open a [GitHub Issue](https://github.com/AgriciDaniel/claude-video/issues) with:
- OS and Python version
- FFmpeg version (`ffmpeg -version`)
- Full error output
- Steps to reproduce

## Suggesting Features

Use [GitHub Discussions](https://github.com/AgriciDaniel/claude-video/discussions).

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make changes
4. Test with a sample video
5. Submit PR with a clear description

### Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/claude-video.git
cd claude-video
bash install.sh
```

### Guidelines

- **Python scripts**: Output JSON for Claude to parse, use argparse for CLI
- **Shell scripts**: Use `set -euo pipefail`, quote variables
- **SKILL.md**: Keep under 500 lines
- **Reference files**: Keep under 200 lines, focused on single topic
- **Naming**: kebab-case for directories, snake_case for scripts
- **Dependencies**: Keep minimal, prefer stdlib over external packages
- **FFmpeg commands**: Always use `-n` flag (no overwrite) unless explicitly requested

### Code Style

- Python: PEP 8
- Shell: `set -euo pipefail`
- TypeScript/React: Remotion patterns (useCurrentFrame, interpolate, spring)
