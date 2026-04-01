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
 * Get luminance stats at a specific time and position.
 * Returns average, max (brightest zone), and variance for smarter decisions.
 */
export function getLuminanceStats(
  contrastMap: ContrastMap,
  timeSec: number,
  position: TextPosition
): { avg: number; max: number; variance: number } {
  const { frames, interval_sec } = contrastMap;
  if (frames.length === 0) return { avg: 0.2, max: 0.3, variance: 0 };

  // Clamp time to video duration
  const maxTime = (frames.length - 1) * interval_sec;
  const clampedTime = Math.max(0, Math.min(timeSec, maxTime));

  const idx = clampedTime / interval_sec;
  const lo = Math.floor(idx);
  const hi = Math.min(frames.length - 1, lo + 1);
  const t = idx - lo;

  const zones = POSITION_ZONES[position] || POSITION_ZONES.center;

  const getStats = (frameIdx: number) => {
    const safeIdx = Math.max(0, Math.min(frameIdx, frames.length - 1));
    const frame = frames[safeIdx];
    if (!frame || !frame.zones) return { avg: frame?.avg_luminance ?? 0.2, max: 0.3, variance: 0 };

    const values: number[] = [];
    for (const row of zones.rows) {
      for (const col of zones.cols) {
        if (
          row >= 0 && row < frame.zones.length &&
          frame.zones[row] &&
          col >= 0 && col < frame.zones[row].length &&
          typeof frame.zones[row][col] === "number"
        ) {
          values.push(frame.zones[row][col]);
        }
      }
    }

    if (values.length === 0) return { avg: frame.avg_luminance, max: frame.avg_luminance, variance: 0 };

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const max = Math.max(...values);
    const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;

    return { avg, max, variance };
  };

  const statsLo = getStats(lo);
  const statsHi = getStats(hi);

  return {
    avg: statsLo.avg + (statsHi.avg - statsLo.avg) * t,
    max: statsLo.max + (statsHi.max - statsLo.max) * t,
    variance: statsLo.variance + (statsHi.variance - statsLo.variance) * t,
  };
}

// Backward compat wrapper
export function getLuminanceAt(
  contrastMap: ContrastMap,
  timeSec: number,
  position: TextPosition
): number {
  return getLuminanceStats(contrastMap, timeSec, position).avg;
}

/**
 * V2: Get adaptive text styling using worst-case (brightest zone) and variance.
 * High variance = busy background = always use strong backing.
 * Brightest zone > 0.5 = force backing regardless of average.
 */
export function getAdaptiveStyle(
  luminance: number,
  maxLuminance?: number,
  variance?: number
): AdaptiveTextStyle {
  const effectiveMax = maxLuminance ?? luminance;
  const effectiveVariance = variance ?? 0;

  // V2: If background is busy (high variance) or has any bright zones, use strong backing
  const isBusy = effectiveVariance > 0.02;
  const hasBrightZone = effectiveMax > 0.5;

  if (isBusy || hasBrightZone) {
    // Strong backing for safety on complex backgrounds
    const backingOpacity = hasBrightZone
      ? interpolate(effectiveMax, [0.5, 0.8], [0.5, 0.75], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0.45;

    return {
      color: BRAND.text,
      backgroundColor: `rgba(10, 10, 10, ${backingOpacity})`,
      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
      backingOpacity,
    };
  }

  // Simple backgrounds: use original 3-tier logic
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
