import React from "react";
import { useCurrentFrame, spring, interpolate, useVideoConfig } from "remotion";
import { FONT } from "../brand";
import { getLuminanceAt, getAdaptiveStyle } from "../hooks/useContrast";
import type { ContrastMap, TextPosition } from "../types";

type AnimationType = "fade" | "spring" | "typewriter" | "slide-up";

interface AdaptiveTextProps {
  text: string;
  contrastMap: ContrastMap;
  position: TextPosition;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  delay?: number; // frames before animation starts
  animation?: AnimationType;
  sceneStartFrame?: number; // global frame where this scene starts
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
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeSec = (sceneStartFrame + frame) / fps;

  // Get luminance at current time + position
  const luminance = getLuminanceAt(contrastMap, timeSec, position);
  const style = getAdaptiveStyle(luminance);

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
        fontSize,
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
