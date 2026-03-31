# Architecture

## Skill Structure

```
claude-video (main orchestrator)
├── 15 sub-skills (one per workflow)
├── 3 agents (encoder, analyst, producer)
├── 19+ scripts (Python + Bash)
├── 15 reference docs (on-demand knowledge)
└── promo-pipeline (Remotion project)
```

## Command Routing

The main skill (`skills/video/SKILL.md`) acts as an orchestrator:

1. User invokes `/video <command>` or describes a task
2. Main skill matches intent to a sub-skill
3. Sub-skill SKILL.md is loaded with specific instructions
4. Scripts execute the actual operations (FFmpeg, Python)
5. Reference files provide domain knowledge when needed

## Sub-Skill Pattern

Each sub-skill is self-contained:

```
skills/video-edit/SKILL.md
  - Focused workflow instructions
  - FFmpeg command patterns
  - Safety rules specific to editing
  - No routing logic (that lives in the main skill)
```

## Promo Pipeline

The promo pipeline combines stock footage with Remotion rendering:

```
Search (Pixabay API)
  → Download + Preprocess (FFmpeg: 1080p, 30fps)
    → Contrast Analysis (4x3 luminance grid per second)
      → TTS Generation (Gemini)
        → Remotion Render
          ├── StockScene (OffthreadVideo + Ken Burns)
          ├── AdaptiveText (contrast-aware backing plates)
          ├── Transitions (fade, wipe, zoom)
          ├── AudioLayer (music + voiceover ducking)
          └── SoundEffectsLayer (transition SFX)
```

## Agent Roles

| Agent | Purpose |
|-------|---------|
| claude-video-encoder | Batch encoding, multi-pass, parallel processing |
| claude-video-analyst | Quality assessment, comprehensive analysis |
| claude-video-producer | Multi-step production pipelines, VRAM management |
