import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { FONT } from "../brand";
import { AdaptiveText } from "./AdaptiveText";
import type { SceneConfig } from "../types";

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  center: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  "lower-third": {
    justifyContent: "flex-end",
    alignItems: "flex-start",
    padding: "0 80px 100px",
  },
  "upper-left": {
    justifyContent: "flex-start",
    alignItems: "flex-start",
    padding: "80px",
  },
  "upper-right": {
    justifyContent: "flex-start",
    alignItems: "flex-end",
    padding: "80px",
  },
};

interface StockSceneProps {
  scene: SceneConfig;
  globalStartFrame: number;
}

export const StockScene: React.FC<StockSceneProps> = ({
  scene,
  globalStartFrame,
}) => {
  const frame = useCurrentFrame();

  // V2: Ken Burns with direction from scene planner
  const kb = scene.kenBurns || { start: 1.0, end: 1.06, origin: "center center" };
  const kenBurnsScale = interpolate(
    frame,
    [0, scene.durationFrames],
    [kb.start, kb.end],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      {/* Video background with directional Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${kenBurnsScale})`,
          transformOrigin: kb.origin,
        }}
      >
        <OffthreadVideo
          src={staticFile(scene.stockPath)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          volume={0}
        />
      </AbsoluteFill>

      {/* Text overlay */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          ...POSITION_STYLES[scene.textPosition] || POSITION_STYLES.center,
        }}
      >
        {scene.headline && (
          <AdaptiveText
            text={scene.headline}
            contrastMap={scene.contrastMap}
            position={scene.textPosition}
            fontSize={56}
            fontFamily={FONT.heading}
            fontWeight={700}
            delay={15}
            animation="spring"
            sceneStartFrame={globalStartFrame}
            intent={scene.intent}
          />
        )}
        {scene.subtext && (
          <AdaptiveText
            text={scene.subtext}
            contrastMap={scene.contrastMap}
            position={scene.textPosition}
            fontSize={24}
            fontFamily={FONT.mono}
            fontWeight={400}
            delay={30}
            animation="slide-up"
            sceneStartFrame={globalStartFrame}
            intent={scene.intent}
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
