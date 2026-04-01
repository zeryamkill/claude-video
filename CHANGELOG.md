# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-01

### Added
- V2 Intelligence Layer: scene planner with automatic aesthetic decisions
- Scene intent classification (hook, problem, feature, proof, cta)
- Contextual transition decision tree (dark-to-bright, hook-to-problem, etc.)
- Per-scene audio ducking with configurable ramp speeds
- Ken Burns direction variation (zoom out reveal, zoom in focus, slow pan)
- Worst-case zone contrast analysis (not average) with variance detection
- `scene_planner.py` script for automatic scene config enhancement
- `promo-quality-checklist.md` reference for pre-export validation
- `cut-impact` transition type (hard cut with white flash)
- `marketplace.json` for plugin distribution
- Validation hooks for SKILL.md frontmatter and FFmpeg safety
- Remote installer with version pinning (`curl | bash` support)
- Python venv creation and dependency installation in installer
- Bounded dependency versioning in requirements.txt with CVE notes

### Changed
- `useContrast.ts`: uses worst-case zone brightness + variance for backing decisions
- `StockScene.tsx`: accepts directional Ken Burns config prop
- `AudioLayer.tsx`: per-scene ducking levels and ramp speeds (not global)
- `Transitions.tsx`: per-transition duration + cut-impact type
- `plugin.json`: added entry_point, skills[], agents[] component manifest
- `install.sh`: supports both local and remote installation with version pinning

### Fixed
- Zoom transition abrupt midpoint: smooth blendFactor interpolation
- Contrast analysis zone bounds validation prevents crashes on malformed data
- CITATION.cff: removed empty ORCID field

## [1.0.0] - 2026-03-31

### Added
- Initial release with 15 sub-skills
- Video editing: trim, cut, split, merge, speed, crop, overlay, stabilize, transitions
- Transcoding with GPU acceleration (NVENC)
- Speech-to-text captioning with animated subtitles (Whisper + ASS)
- Video analysis with quality metrics (VMAF, SSIM, PSNR)
- AI video generation via Google Veo 3.x
- AI image generation (Gemini, FLUX.2, Stable Diffusion)
- Stock footage promo pipeline with contrast-aware adaptive text
- Shortform pipeline (longform to TikTok/Reels/Shorts)
- Audio processing: loudness normalization, noise reduction, Gemini TTS
- AI enhancement: Real-ESRGAN upscale, RIFE interpolation, CodeFormer
- Platform export for YouTube, TikTok, Instagram, LinkedIn, Web, GIF
- 3 specialized agents: encoder, analyst, producer
- Remotion promo pipeline with stock search, contrast analysis, adaptive text, audio ducking
