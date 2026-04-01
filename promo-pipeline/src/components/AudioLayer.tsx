import React from "react";
import { Audio, staticFile, useCurrentFrame, interpolate, Sequence } from "remotion";
import type { PromoVideoProps } from "../types";

interface AudioLayerProps {
  props: PromoVideoProps;
  totalFrames: number;
}

export const AudioLayer: React.FC<AudioLayerProps> = ({
  props,
  totalFrames,
}) => {
  const frame = useCurrentFrame();

  // Pre-compute scene start frames
  const sceneTimings = props.scenes.map((scene, i) => {
    const startFrame = props.scenes
      .slice(0, i)
      .reduce((sum, s) => sum + s.durationFrames, 0);
    return { ...scene, startFrame };
  });

  // V2: Per-scene ducking with smooth ramps
  // Find which scene is active and get its specific audio settings
  const globalDuckLevel = props.voiceoverDucking || 0.15;
  const globalRampFrames = props.duckingFadeFrames ?? 10;
  const baseVolume = props.musicVolume || 0.3;

  let musicVol = baseVolume;
  for (const s of sceneTimings) {
    if (!s.voiceoverPath) continue;

    // V2: Use per-scene ducking level and ramp speed
    const duckLevel = s.sceneAudio?.duckingLevel ?? globalDuckLevel;
    const rampFrames = s.sceneAudio?.duckingRampFrames ?? globalRampFrames;

    const voStart = s.startFrame;
    const voEnd = s.startFrame + s.durationFrames;

    if (frame >= voStart - rampFrames && frame < voEnd + rampFrames) {
      const duckDown = interpolate(
        frame,
        [voStart - rampFrames, voStart],
        [baseVolume, duckLevel],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const duckUp = interpolate(
        frame,
        [voEnd, voEnd + rampFrames],
        [duckLevel, baseVolume],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      if (frame < voStart) {
        musicVol = duckDown;
      } else if (frame >= voEnd) {
        musicVol = duckUp;
      } else {
        musicVol = duckLevel;
      }
      break;
    }
  }

  // Music fade in/out
  const fadeIn = interpolate(
    frame,
    [0, props.musicFadeInFrames || 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const fadeOut = interpolate(
    frame,
    [totalFrames - (props.musicFadeOutFrames || 60), totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {props.musicPath && (
        <Audio
          src={staticFile(props.musicPath)}
          volume={musicVol * fadeIn * fadeOut}
        />
      )}

      {sceneTimings
        .filter((s) => s.voiceoverPath)
        .map((s) => (
          <Sequence
            key={`vo-${s.id}`}
            from={s.startFrame}
            durationInFrames={s.durationFrames}
            layout="none"
          >
            <Audio
              src={staticFile(s.voiceoverPath!)}
              volume={1}
            />
          </Sequence>
        ))}
    </>
  );
};
