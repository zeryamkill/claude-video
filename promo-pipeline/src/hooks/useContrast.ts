import { interpolate } from "remotion";
import type { ContrastMap, TextPosition, AdaptiveTextStyle } from "../types";
import { BRAND } from "../brand";

// Map text positions to grid zones (3 rows x 4 cols)
const POSITION_ZONES: Record<TextPosition, { rows: number[]; cols: number[] }> = {
  center: { rows: [1], cols: [1, 2] },
  "lower-third": { rows: [2], cols: [0, 1, 2, 3] },
  "upper-left": { rows: [0], cols: [0, 1] },
  "upper-right": { rows: [0], cols: [2, 3] },
};

/**
 * Get the average luminance at a specific time and position from a contrast map.
 * Interpolates between adjacent frame samples for smoothness.
 */
export function getLuminanceAt(
  contrastMap: ContrastMap,
  timeSec: number,
  position: TextPosition
): number {
  const { frames, interval_sec } = contrastMap;
  if (frames.length === 0) return 0.2; // assume dark if no data

  // Clamp time to video duration to prevent out-of-bounds
  const maxTime = (frames.length - 1) * interval_sec;
  const clampedTime = Math.max(0, Math.min(timeSec, maxTime));

  // Find surrounding frames
  const idx = clampedTime / interval_sec;
  const lo = Math.floor(idx);
  const hi = Math.min(frames.length - 1, lo + 1);
  const t = idx - lo; // interpolation factor, always 0-1

  const zones = POSITION_ZONES[position] || POSITION_ZONES.center;

  const getLum = (frameIdx: number): number => {
    const safeIdx = Math.max(0, Math.min(frameIdx, frames.length - 1));
    const frame = frames[safeIdx];
    if (!frame || !frame.zones) return frame?.avg_luminance ?? 0.2;

    let sum = 0;
    let count = 0;
    for (const row of zones.rows) {
      for (const col of zones.cols) {
        // Validate zone bounds before access
        if (
          row >= 0 &&
          row < frame.zones.length &&
          frame.zones[row] &&
          col >= 0 &&
          col < frame.zones[row].length &&
          typeof frame.zones[row][col] === "number"
        ) {
          sum += frame.zones[row][col];
          count++;
        }
      }
    }
    return count > 0 ? sum / count : frame.avg_luminance;
  };

  const lumLo = getLum(lo);
  const lumHi = getLum(hi);
  return lumLo + (lumHi - lumLo) * t;
}

/**
 * Get adaptive text styling based on background luminance.
 * Returns colors, backing plate opacity, and shadow settings.
 */
export function getAdaptiveStyle(luminance: number): AdaptiveTextStyle {
  if (luminance < 0.3) {
    return {
      color: BRAND.text,
      backgroundColor: "transparent",
      textShadow: "0 2px 8px rgba(0,0,0,0.7)",
      backingOpacity: 0,
    };
  } else if (luminance < 0.6) {
    const backingOpacity = interpolate(luminance, [0.3, 0.6], [0.3, 0.6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return {
      color: BRAND.text,
      backgroundColor: `rgba(10, 10, 10, ${backingOpacity})`,
      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
      backingOpacity,
    };
  } else {
    return {
      color: BRAND.text,
      backgroundColor: "rgba(10, 10, 10, 0.7)",
      textShadow: "none",
      backingOpacity: 0.7,
    };
  }
}
