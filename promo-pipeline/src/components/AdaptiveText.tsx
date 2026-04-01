import React from "react";
import { useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import { FONT } from "../brand";
import { getLuminanceStats, getAdaptiveStyle } from "../hooks/useContrast";
import type { ContrastMap, TextPosition, SceneIntent } from "../types";

type AnimationType = "fade" | "spring" | "typewriter" | "slide-up";

interface AdaptiveTextProps {
  text: string;
  contrastMap: ContrastMap;
  position: TextPosition;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  delay?: number;
  animation?: AnimationType;
  sceneStartFrame?: number;
  intent?: SceneIntent;  // V2: scene intent for CTA styling
}

export const AdaptiveText: React.FC<AdaptiveTextProps> = ({
  text,
  contrastMap,
  position,
  fontSize = 48,
  fontFamily = FONT.heading,
  fontWeight = 700,
  delay = 0,
  animation = "fade",
  sceneStartFrame = 0,
  intent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeSec = (sceneStartFrame + frame) / fps;

  // V2: Use full luminance stats (avg + max + variance) for smarter backing
  const stats = getLuminanceStats(contrastMap, timeSec, position);
  const style = getAdaptiveStyle(stats.avg, stats.max, stats.variance);

  // V2: CTA scenes get larger text and accent glow
  const isCTA = intent === "cta";
  const effectiveFontSize = isCTA ? Math.round(fontSize * 1.15) : fontSize;

  // Animation
  let opacity = 1;
  let translateY = 0;
  let scale = 1;
  let displayText = text;

  switch (animation) {
    case "fade":
      opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      break;
    case "spring":
      scale = spring({
        frame: Math.max(0, frame - delay),
        fps,
        config: { damping: 12, stiffness: 80 },
      });
      opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      break;
    case "typewriter":
      const chars = Math.min(
        text.length,
        Math.max(0, Math.floor((frame - delay) / 1.2))
      );
      displayText = text.substring(0, chars);
      opacity = 1;
      break;
    case "slide-up":
      translateY = interpolate(frame, [delay, delay + 20], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
      break;
  }

  // No CSS transitions in Remotion — it renders frame-by-frame.
  // Backing plate opacity is already computed per-frame by getAdaptiveStyle.
  const hasBacking = style.backingOpacity > 0.01;

  return (
    <div
      style={{
        fontSize: effectiveFontSize,
        fontFamily,
        fontWeight,
        color: style.color,
        textShadow: style.textShadow,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        backgroundColor: hasBacking ? style.backgroundColor : "transparent",
        padding: hasBacking ? "12px 24px" : "0",
        borderRadius: hasBacking ? 8 : 0,
      }}
    >
      {displayText}
    </div>
  );
};
