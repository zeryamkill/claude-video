# Command Reference

## Core Commands

| Command | Description |
|---------|-------------|
| `/video` | Interactive mode, describe what you want |
| `/video edit` | Trim, cut, split, merge, speed, crop, overlay, stabilize, transitions |
| `/video transcode` | Convert codecs, compress, GPU-accelerated encoding, two-pass |
| `/video audio` | Normalize loudness, reduce noise, mix, extract, remove silence |
| `/video caption` | Transcribe speech to animated subtitles (Whisper + ASS) |
| `/video analyze` | Inspect with FFprobe, measure quality (VMAF/SSIM/PSNR), detect scenes |
| `/video export <platform>` | Export for YouTube, TikTok, Instagram, LinkedIn, Web, GIF, Podcast |
| `/video download <url>` | Download video via yt-dlp with format selection |

## Creative Commands

| Command | Description |
|---------|-------------|
| `/video create` | Programmatic video creation via Remotion (React-based) |
| `/video promo` | Stock footage promo videos with contrast-aware text |
| `/video shorts` | Longform to shortform pipeline (transcribe, score, crop, caption) |

## AI Commands

| Command | Description |
|---------|-------------|
| `/video generate` | AI video generation via Google Veo 3.x |
| `/video image` | AI image generation (Gemini, FLUX.2, Stable Diffusion) |
| `/video screenshot` | Web capture via Playwright |
| `/video enhance` | AI upscale (Real-ESRGAN), frame interpolation (RIFE), face restore (CodeFormer) |
| `/video enhance-audio` | AI source separation (Demucs), denoise (DeepFilterNet), TTS |

## Setup Commands

| Command | Description |
|---------|-------------|
| `/video setup` | Install core dependencies |
| `/video setup --ai` | Install AI dependencies (PyTorch, WhisperX, etc.) |
