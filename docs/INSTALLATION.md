# Installation Guide

## Prerequisites

| Tool | Version | Required | Purpose |
|------|---------|----------|---------|
| FFmpeg | 6.x+ | Yes | All video operations |
| Python | 3.10+ | Yes | Scripts and analysis |
| Node.js | 18+ | Optional | Remotion promo pipeline |
| NVIDIA GPU | Any NVENC | Optional | Hardware acceleration |

## Quick Install (Linux/macOS)

```bash
git clone https://github.com/AgriciDaniel/claude-video.git
cd claude-video
bash install.sh
```

## What Gets Installed

The installer copies files to your user directory:

```
~/.claude/skills/claude-video/          Main skill + scripts + references
~/.claude/skills/claude-video-edit/     Editing sub-skill
~/.claude/skills/claude-video-promo/    Promo pipeline sub-skill
... (15 sub-skills total)
~/.claude/agents/claude-video-*.md      3 specialized agents
```

No system-level changes. No sudo required. No background services.

## Promo Pipeline Setup

The promo pipeline uses Remotion (React-based video rendering) and requires Node.js:

```bash
cd claude-video/promo-pipeline
npm install
```

### API Keys (Optional)

For stock footage search and TTS voiceover:

```bash
export PIXABAY_API_KEY="your-key"       # Free at pixabay.com/api/docs/
export GOOGLE_AI_API_KEY="your-key"     # For Gemini TTS
```

## Verify Installation

```bash
claude
/video
```

You should see the interactive mode prompt.

## Uninstall

```bash
bash uninstall.sh
```

Or manually:

```bash
rm -rf ~/.claude/skills/claude-video*
rm -f ~/.claude/agents/claude-video-*.md
```
