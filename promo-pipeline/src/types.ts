// Scene configuration types for the promo pipeline V2

export type TextPosition = "center" | "lower-third" | "upper-left" | "upper-right";

export type TransitionType = "fade" | "wipe-left" | "wipe-right" | "zoom" | "cut" | "cut-impact";

export type SceneIntent = "hook" | "problem" | "feature" | "proof" | "cta";

export interface KenBurnsConfig {
  start: number;   // starting scale (e.g. 1.0 or 1.06)
  end: number;     // ending scale
  origin: string;  // CSS transform-origin (e.g. "center center" or "40% 50%")
}

export interface ContrastFrame {
  time_sec: number;
  zones: number[][];  // 3 rows x 4 cols of luminance values (0-1)
  avg_luminance: number;
  classification: "dark" | "mid" | "bright";
}

export interface ContrastMap {
  clip: string;
  interval_sec: number;
  grid_rows: number;
  grid_cols: number;
  duration_sec: number;
  frames: ContrastFrame[];
}

export interface SceneAudioConfig {
  duckingLevel: number;       // per-scene ducking (e.g. 0.08 for CTA, 0.15 for proof)
  duckingRampFrames: number;  // smooth ramp speed (5 for urgent, 15 for calm)
}

export interface SceneConfig {
  id: string;
  durationFrames: number;
  stockPath: string;
  contrastMap: ContrastMap;
  headline?: string;
  subtext?: string;
  textPosition: TextPosition;
  transition: TransitionType;
  transitionDurationFrames?: number;  // V2: per-transition duration (default 15)
  voiceoverPath?: string;
  intent?: SceneIntent;               // V2: scene intent for styling
  kenBurns?: KenBurnsConfig;          // V2: directional Ken Burns
  sceneAudio?: SceneAudioConfig;      // V2: per-scene audio settings
}

export interface SoundEffect {
  id: string;
  frameStart: number;
  sfxPath: string;
  volume: number;
}

export interface PromoVideoProps {
  scenes: SceneConfig[];
  musicPath?: string;
  musicVolume: number;
  musicFadeInFrames: number;
  musicFadeOutFrames: number;
  voiceoverDucking: number;       // global fallback ducking level
  duckingFadeFrames?: number;     // global fallback ramp (default 10)
  soundEffects?: SoundEffect[];
}

// Adaptive text styling result
export interface AdaptiveTextStyle {
  color: string;
  backgroundColor: string;
  textShadow: string;
  backingOpacity: number;
}
