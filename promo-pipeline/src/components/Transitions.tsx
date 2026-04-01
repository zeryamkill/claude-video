import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { BRAND } from "../brand";
import type { TransitionType } from "../types";

interface TransitionProps {
  type: TransitionType;
  durationFrames: number;
  transitionFrames?: number;  // V2: per-transition duration (default 15)
  children: React.ReactNode;
}

export const SceneWithTransition: React.FC<TransitionProps> = ({
  type,
  durationFrames,
  transitionFrames = 15,
  children,
}) => {
  const frame = useCurrentFrame();

  if (type === "cut") {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  // V2: cut-impact = hard cut with brief white flash
  if (type === "cut-impact") {
    const flashOpacity = interpolate(frame, [0, 3, 8], [0.6, 0.3, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

    return (
      <AbsoluteFill>
        {children}
        {frame < 8 && (
          <AbsoluteFill
            style={{
              backgroundColor: BRAND.text,
              opacity: flashOpacity,
              pointerEvents: "none",
            }}
          />
        )}
      </AbsoluteFill>
    );
  }

  // Fade
  if (type === "fade") {
    const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const fadeOut = interpolate(
      frame,
      [durationFrames - transitionFrames, durationFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    return (
      <AbsoluteFill style={{ opacity: fadeIn * fadeOut }}>
        {children}
      </AbsoluteFill>
    );
  }

  // Wipe left/right
  if (type === "wipe-left" || type === "wipe-right") {
    const direction = type === "wipe-left" ? 1 : -1;
    const enterPct = interpolate(frame, [0, transitionFrames], [0, 100], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const exitPct = interpolate(
      frame,
      [durationFrames - transitionFrames, durationFrames],
      [100, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const clipPct = Math.min(enterPct, exitPct);
    const clipPath =
      direction === 1
        ? `inset(0 ${100 - clipPct}% 0 0)`
        : `inset(0 0 0 ${100 - clipPct}%)`;

    return (
      <AbsoluteFill style={{ clipPath }}>
        {children}
      </AbsoluteFill>
    );
  }

  // Zoom
  if (type === "zoom") {
    const enterScale = interpolate(frame, [0, transitionFrames], [0.9, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const enterOpacity = interpolate(frame, [0, transitionFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const exitScale = interpolate(
      frame,
      [durationFrames - transitionFrames, durationFrames],
      [1, 1.1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const exitOpacity = interpolate(
      frame,
      [durationFrames - transitionFrames, durationFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );

    const blendFactor = interpolate(
      frame,
      [transitionFrames, durationFrames - transitionFrames],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
    const smoothScale = enterScale * (1 - blendFactor) + exitScale * blendFactor;

    return (
      <AbsoluteFill
        style={{
          opacity: enterOpacity * exitOpacity,
          transform: `scale(${smoothScale})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  // Fallback
  return <AbsoluteFill>{children}</AbsoluteFill>;
};
