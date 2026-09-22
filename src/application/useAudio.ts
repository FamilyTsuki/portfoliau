import { useCallback, useState } from "react";
import type { SoundTrigger } from "@/domain/game/services/physics";
import { soundSynth } from "@/infrastructure/audio/sound-synth";

export function useAudio() {
  const [isMuted, setIsMuted] = useState<boolean>(() => soundSynth.isMuted());

  const toggleMute = useCallback(() => {
    const next = soundSynth.toggleMute();
    setIsMuted(next);
  }, []);

  const playSound = useCallback((trigger: SoundTrigger) => {
    soundSynth.play(trigger);
  }, []);

  return {
    isMuted,
    toggleMute,
    playSound,
  };
}
