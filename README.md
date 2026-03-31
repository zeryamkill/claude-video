# Claude Video: AI Video Production Suite for Claude Code

AI-powered video production suite for [Claude Code](https://claude.ai/claude-code). Edit, transcode, caption, analyze, generate, and create promo videos: all from your terminal.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Claude Code Skill](https://img.shields.io/badge/Claude_Code-Skill-orange)](https://claude.ai/claude-code)

## Features

- **Video Editing**: Trim, cut, split, merge, speed, crop, overlay, stabilize, transitions
- **Transcoding**: H.264, H.265, AV1, VP9, ProRes. GPU-accelerated with NVIDIA NVENC
- **Captioning**: Speech-to-text (Whisper) + animated word-by-word subtitles
- **Analysis**: FFprobe metadata, VMAF/SSIM/PSNR quality metrics, scene detection
- **AI Video Generation**: Google Veo 3.x text-to-video with native audio
- **AI Image Generation**: Gemini, FLUX.2, Stable Diffusion for video assets
- **Stock Footage Promos**: Pixabay/Pexels stock video + Remotion text overlays with contrast-aware adaptive text
- **Shortform Pipeline**: Longform → TikTok/Reels/Shorts (transcribe, score, crop 9:16, caption)
- **Audio Processing**: Loudness normalization, noise reduction, mixing, Gemini TTS voiceover
- **AI Enhancement**: Real-ESRGAN upscale, RIFE frame interpolation, CodeFormer face restore
- **Platform Export**: One-command export for YouTube, TikTok, Instagram, LinkedIn, Web, GIF

## Installation

### Manual Install (Linux/macOS)

```bash
git clone https://github.com/AgriciDaniel/claude-video.git
cd claude-video
bash install.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/AgriciDaniel/claude-video.git
cd claude-video
# Copy skills manually to %USERPROFILE%\.claude\skills\
```

### Prerequisites

- **FFmpeg**: Required for all video operations
- **Python 3.10+**: For scripts (analysis, TTS, stock search)
- **Node.js 18+**: For Remotion promo pipeline (optional)
- **NVIDIA GPU**: Optional, enables NVENC hardware acceleration

## Quick Start

```bash
claude
/video                    # Interactive: describe what you want
/video edit               # Trim, cut, merge, transitions
/video transcode          # Convert codecs, compress
/video caption            # Transcribe + animated subtitles
/video analyze            # Inspect metadata, quality metrics
/video export youtube     # Platform-optimized export
/video promo              # Stock footage promo with adaptive text
/video generate           # AI video generation (Veo)
/video shorts             # Longform → shortform clips
/video enhance            # AI upscale, face restore
```

## Commands

| Command | What it does |
|---------|-------------|
| `/video` | Interactive mode: describe what you want |
| `/video edit` | Trim, cut, split, merge, speed, crop, overlay, stabilize, transitions |
| `/video transcode` | Convert codecs, compress, GPU-accelerated encoding |
| `/video audio` | Normalize loudness, reduce noise, mix, extract |
| `/video caption` | Transcribe speech → animated subtitles (Whisper + ASS) |
| `/video analyze` | Inspect with FFprobe, measure quality (VMAF/SSIM/PSNR) |
| `/video export` | One-command export: YouTube, TikTok, Instagram, LinkedIn, Web, GIF |
| `/video download` | Download video via yt-dlp |
| `/video create` | Programmatic video creation via Remotion |
| `/video shorts` | Longform → shortform pipeline |
| `/video image` | AI image generation (Gemini, FLUX.2, SD) |
| `/video generate` | AI video generation (Veo 3.x) |
| `/video screenshot` | Web capture via Playwright |
| `/video enhance` | AI upscale, frame interpolation, face restore |
| `/video enhance-audio` | AI audio: source separation, denoise, TTS |
| `/video promo` | Stock footage promo videos with contrast-aware text |

## Architecture

```
~/.claude/
├── skills/
│   ├── claude-video/              # Main orchestrator
│   │   ├── SKILL.md               # Command routing
│   │   ├── scripts/               # 19 Python/Bash scripts
│   │   └── references/            # 15 on-demand knowledge files
│   ├── claude-video-edit/         # Editing sub-skill
│   ├── claude-video-transcode/    # Transcoding sub-skill
│   ├── claude-video-caption/      # Captioning sub-skill
│   ├── claude-video-promo/        # Stock footage promo sub-skill
│   └── ... (15 sub-skills total)
└── agents/
    ├── claude-video-encoder.md    # Batch encoding specialist
    ├── claude-video-analyst.md    # Quality assessment specialist
    └── claude-video-producer.md   # Production pipeline specialist
```

### Promo Pipeline (Stock Footage + Remotion)

The promo pipeline creates marketing videos using free stock footage with contrast-aware text:

```
Search Pixabay → Download → Analyze Contrast → Generate TTS → Render with Remotion
                                    ↓
                          4x3 luminance grid per second
                                    ↓
                    AdaptiveText adjusts backing plate per frame
                    Dark bg → no backing | Bright bg → dark plate
```

## Promo Pipeline Setup

```bash
cd claude-video/promo-pipeline
npm install
export PIXABAY_API_KEY="your-free-key"      # Get at pixabay.com/api/docs/
export GOOGLE_AI_API_KEY="your-gemini-key"   # For TTS voiceover
```

## Ecosystem

Part of the AI Marketing Suite:

| Skill | Purpose |
|-------|---------|
| [Claude SEO](https://github.com/AgriciDaniel/claude-seo) | SEO analysis, audits, schema |
| [Claude Blog](https://github.com/AgriciDaniel/claude-blog) | Blog writing, optimization |
| **Claude Video** | Video production, promos |

## Requirements

- FFmpeg 6.x+
- Python 3.10+
- Node.js 18+ (for Remotion promo pipeline)
- Optional: NVIDIA GPU with NVENC for hardware acceleration

## Uninstall

```bash
# Remove skills
rm -rf ~/.claude/skills/claude-video*

# Remove agents
rm -f ~/.claude/agents/claude-video-*.md
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
