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
  const duckFade = props.duckingFadeFrames ?? 10;

  // Pre-compute scene start frames
  const sceneTimings = props.scenes.map((scene, i) => {
    const startFrame = props.scenes
      .slice(0, i)
      .reduce((sum, s) => sum + s.durationFrames, 0);
    return { ...scene, startFrame };
  });

  // Smooth ducking: compute target music volume based on voiceover activity
  // Instead of instant switch, ramp over duckFade frames
  const baseVolume = props.musicVolume || 0.3;
  const duckVolume = props.voiceoverDucking || 0.15;

  // Find voiceover regions and compute ducking envelope
  let musicVol = baseVolume;
  for (const s of sceneTimings) {
    if (!s.voiceoverPath) continue;
    const voStart = s.startFrame;
    const voEnd = s.startFrame + s.durationFrames;

    if (frame >= voStart - duckFade && frame < voEnd + duckFade) {
      // Ramp down before voiceover, hold during, ramp up after
      const duckDown = interpolate(
        frame,
        [voStart - duckFade, voStart],
        [baseVolume, duckVolume],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );
      const duckUp = interpolate(
        frame,
        [voEnd, voEnd + duckFade],
        [duckVolume, baseVolume],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      );

      if (frame < voStart) {
        musicVol = duckDown;
      } else if (frame >= voEnd) {
        musicVol = duckUp;
      } else {
        musicVol = duckVolume;
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
      {/* Background music with smooth ducking */}
      {props.musicPath && (
        <Audio
          src={staticFile(props.musicPath)}
          volume={musicVol * fadeIn * fadeOut}
        />
      )}

      {/* Per-scene voiceovers */}
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
