import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { BRAND } from "../brand";
import { StockScene } from "./StockScene";
import { SceneWithTransition } from "./Transitions";
import { AudioLayer } from "./AudioLayer";
import { SoundEffectsLayer } from "./SoundEffectsLayer";
import type { PromoVideoProps } from "../types";

export const PromoVideo: React.FC<PromoVideoProps> = (props) => {
  const totalFrames = props.scenes.reduce((sum, s) => sum + s.durationFrames, 0);

  let currentFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: BRAND.bg }}>
      {/* Video scenes */}
      {props.scenes.map((scene) => {
        const startFrame = currentFrame;
        currentFrame += scene.durationFrames;

        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={scene.durationFrames}
          >
            <SceneWithTransition
              type={scene.transition}
              durationFrames={scene.durationFrames}
            >
              <StockScene
                scene={scene}
                globalStartFrame={startFrame}
              />
            </SceneWithTransition>
          </Sequence>
        );
      })}

      {/* Audio: music + voiceovers + ducking */}
      <AudioLayer props={props} totalFrames={totalFrames} />

      {/* Sound effects at transitions */}
      {props.soundEffects && (
        <SoundEffectsLayer soundEffects={props.soundEffects} />
      )}
    </AbsoluteFill>
  );
};
