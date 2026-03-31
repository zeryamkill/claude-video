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

// Position presets: CSS styles for text placement
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

  // Ken Burns: subtle slow zoom over the scene duration
  const kenBurns = interpolate(
    frame,
    [0, scene.durationFrames],
    [1.0, 1.06],
    { extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill>
      {/* Video background with Ken Burns */}
      <AbsoluteFill
        style={{
          transform: `scale(${kenBurns})`,
          transformOrigin: "center center",
        }}
      >
        {/* OffthreadVideo is more reliable than Video for stock footage —
            renders frames off the main thread, handles codec quirks better.
            Stock videos should be pre-trimmed to >= scene duration by stock_download.py */}
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
          />
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
