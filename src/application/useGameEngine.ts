import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Platform } from "@/domain/game/entities/runner";
import {
  createInitialGameState,
  tickPhysics,
  type MovementInput,
  type SoundTrigger,
} from "@/domain/game/services/physics";

interface UseGameEngineOptions {
  readonly onSound?: (type: SoundTrigger) => void;
  readonly platforms?: readonly Platform[];
  readonly worldWidth?: number;
  readonly worldHeight?: number;
}

function isInputElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
  );
}

function isLeftKey(e: KeyboardEvent): boolean {
  return (
    e.code === "ArrowLeft" ||
    e.code === "KeyA" ||
    e.key === "q" ||
    e.key === "Q"
  );
}

function isRightKey(e: KeyboardEvent): boolean {
  return (
    e.code === "ArrowRight" ||
    e.code === "KeyD" ||
    e.key === "d" ||
    e.key === "D"
  );
}

function isJumpKey(e: KeyboardEvent): boolean {
  return (
    e.code === "Space" ||
    e.code === "ArrowUp" ||
    e.code === "KeyW" ||
    e.key === "z" ||
    e.key === "Z"
  );
}

function isResetKey(e: KeyboardEvent): boolean {
  return e.key === "r" || e.key === "R";
}

/**
 * Hook d'orchestration du moteur de jeu :
 * Gère les entrées clavier (QWERTY & AZERTY), la synchronisation physique
 * et le rafraîchissement réactif du canvas.
 */
export function useGameEngine({
  onSound,
  platforms,
  worldWidth = 1200,
  worldHeight = 2000,
}: UseGameEngineOptions = {}) {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  const worldWidthRef = useRef(worldWidth);
  worldWidthRef.current = worldWidth;

  const worldHeightRef = useRef(worldHeight);
  worldHeightRef.current = worldHeight;

  const onSoundRef = useRef(onSound);
  onSoundRef.current = onSound;

  const inputRef = useRef<MovementInput>({
    left: false,
    right: false,
    jumpPressed: false,
    jumpHeld: false,
  });

  const setPlatforms = useCallback((newPlatforms: readonly Platform[]) => {
    stateRef.current = {
      ...stateRef.current,
      platforms: newPlatforms,
    };
    setGameState((prev) => ({
      ...prev,
      platforms: newPlatforms,
    }));
  }, []);

  useEffect(() => {
    if (platforms && platforms.length > 0) {
      setPlatforms(platforms);
    }
  }, [platforms, setPlatforms]);

  const resetGame = useCallback(() => {
    const fresh = createInitialGameState();
    const currentPlatforms = stateRef.current.platforms;
    const withPlatforms = { ...fresh, platforms: currentPlatforms };
    setGameState(withPlatforms);
    stateRef.current = withPlatforms;
    onSoundRef.current?.("respawn");
  }, []);

  // Écouteurs de clavier (support complet AZERTY / QWERTY / Flèches)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputElement(e.target)) return;

      if (isLeftKey(e)) {
        inputRef.current = { ...inputRef.current, left: true };
      }
      if (isRightKey(e)) {
        inputRef.current = { ...inputRef.current, right: true };
      }
      if (isJumpKey(e)) {
        e.preventDefault();
        const shouldTriggerPress = !inputRef.current.jumpHeld;
        inputRef.current = {
          ...inputRef.current,
          jumpPressed: shouldTriggerPress ? true : inputRef.current.jumpPressed,
          jumpHeld: true,
        };
      }
      if (isResetKey(e)) {
        resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isInputElement(e.target)) return;

      if (isLeftKey(e)) {
        inputRef.current = { ...inputRef.current, left: false };
      }
      if (isRightKey(e)) {
        inputRef.current = { ...inputRef.current, right: false };
      }
      if (isJumpKey(e)) {
        inputRef.current = { ...inputRef.current, jumpHeld: false };
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [resetGame]);

  // Boucle de simulation de jeu (synchronisée sur requestAnimationFrame)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const currentState = stateRef.current;
      const nextState = tickPhysics(
        currentState,
        inputRef.current,
        dt,
        worldWidthRef.current,
        worldHeightRef.current,
        (sound: SoundTrigger) => onSoundRef.current?.(sound),
      );

      // Consomme l'impulsion de saut pressée
      inputRef.current = {
        ...inputRef.current,
        jumpPressed: false,
      };

      stateRef.current = nextState;
      setGameState(nextState);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return {
    state: gameState,
    resetGame,
    setPlatforms,
  };
}
