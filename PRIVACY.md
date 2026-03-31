# Privacy Policy

## Data Collection

Claude Video does not collect, store, or transmit any personal data.

## What Happens Locally

- All video processing runs on your machine via FFmpeg
- Downloaded stock footage is stored in your local `public/` directory
- Generated TTS audio is stored locally
- Contrast analysis data stays on disk as JSON files

## External API Calls

When using certain features, the following external services may be contacted:

- **Pixabay API**: Stock footage and music search (your API key, search queries)
- **Pexels API**: Stock footage search (your API key, search queries)
- **Google Gemini API**: TTS voiceover generation (your API key, text to speak)
- **Google Veo API**: AI video generation (your API key, prompts)

These calls are made only when you explicitly invoke the relevant commands. No background telemetry or analytics are collected.

## Credentials

API keys are read from environment variables at runtime. They are never stored in the repository or written to disk by the skill.
