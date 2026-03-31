import React from "react";
import { Audio, staticFile, Sequence } from "remotion";
import type { SoundEffect } from "../types";

interface SoundEffectsLayerProps {
  soundEffects: SoundEffect[];
}

export const SoundEffectsLayer: React.FC<SoundEffectsLayerProps> = ({
  soundEffects,
}) => {
  if (!soundEffects || soundEffects.length === 0) return null;

  return (
    <>
      {soundEffects.map((sfx) => (
        <Sequence key={sfx.id} from={sfx.frameStart} layout="none">
          <Audio
            src={staticFile(sfx.sfxPath)}
            volume={sfx.volume}
          />
        </Sequence>
      ))}
    </>
  );
};
