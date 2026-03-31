# Troubleshooting

## FFmpeg Not Found

```
Error: FFmpeg not found
```

Install FFmpeg:
- Ubuntu/Debian: `sudo apt install ffmpeg`
- macOS: `brew install ffmpeg`
- Windows: Download from https://ffmpeg.org/download.html

## NVENC Not Available

If GPU encoding fails, the pipeline falls back to CPU encoding automatically. To check NVENC:

```bash
ffmpeg -encoders 2>/dev/null | grep nvenc
```

If no output, your GPU may not support NVENC, or drivers need updating.

## Remotion Render Fails

If `npx remotion render` fails:

1. Ensure Node.js 18+ is installed: `node -v`
2. Install dependencies: `cd promo-pipeline && npm install`
3. Check compositions load: `npx remotion compositions`

## Stock Video Choppy in Remotion

Pre-process stock footage to 1080p 30fps before embedding:

```bash
python3 scripts/stock_download.py --url "URL" --output public/stock/clip.mp4
```

This ensures the video matches Remotion's render framerate.

## TTS Generation Fails

- Check `GOOGLE_AI_API_KEY` is set: `echo $GOOGLE_AI_API_KEY`
- The TTS model is `gemini-2.5-flash-preview-tts` (requires Google AI API key)
- Rate limits: Gemini has per-minute request limits; space requests if generating many clips

## Pixabay Search Returns No Results

- Verify API key: `echo $PIXABAY_API_KEY`
- Try broader search terms
- Check rate limits (100 requests per minute for free tier)
