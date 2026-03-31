// Scene configuration types for the promo pipeline

export type TextPosition = "center" | "lower-third" | "upper-left" | "upper-right";

export type TransitionType = "fade" | "wipe-left" | "wipe-right" | "zoom" | "cut";

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

export interface SceneConfig {
  id: string;
  durationFrames: number;
  stockPath: string;              // path relative to public/
  contrastMap: ContrastMap;
  headline?: string;
  subtext?: string;
  textPosition: TextPosition;
  transition: TransitionType;
  voiceoverPath?: string;         // path relative to public/
}

export interface SoundEffect {
  id: string;
  frameStart: number;             // global frame where SFX starts
  sfxPath: string;                // path relative to public/
  volume: number;                 // 0-1
}

export interface PromoVideoProps {
  scenes: SceneConfig[];
  musicPath?: string;
  musicVolume: number;
  musicFadeInFrames: number;
  musicFadeOutFrames: number;
  voiceoverDucking: number;       // music volume during voiceover (e.g. 0.15)
  duckingFadeFrames?: number;     // smooth ducking ramp in frames (default 10)
  soundEffects?: SoundEffect[];   // transition SFX at scene boundaries
}

// Adaptive text styling result
export interface AdaptiveTextStyle {
  color: string;
  backgroundColor: string;
  textShadow: string;
  backingOpacity: number;
}
