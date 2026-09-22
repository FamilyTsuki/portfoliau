import { useCallback, useEffect, useRef, useState } from "react";
import type { GameState, Platform } from "@/domain/game/entities/runner";
import {
  createInitialGameState,
  tickPhysics,
  type MovementInput,
  type SoundTrigger,
} from "@/domain/game/services/physics";

interface UseGameEngineOptions {
  onSound?: (type: SoundTrigger) => void;
  platforms?: readonly Platform[];
  worldWidth?: number;
  worldHeight?: number;
}

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

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA" ||
        e.key === "q" ||
        e.key === "Q"
      ) {
        inputRef.current.left = true;
      }
      if (
        e.code === "ArrowRight" ||
        e.code === "KeyD" ||
        e.key === "d" ||
        e.key === "D"
      ) {
        inputRef.current.right = true;
      }
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.key === "z" ||
        e.key === "Z"
      ) {
        e.preventDefault();
        if (!inputRef.current.jumpHeld) {
          inputRef.current.jumpPressed = true;
        }
        inputRef.current.jumpHeld = true;
      }
      if (e.key === "r" || e.key === "R") {
        resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.code === "ArrowLeft" ||
        e.code === "KeyA" ||
        e.key === "q" ||
        e.key === "Q"
      ) {
        inputRef.current.left = false;
      }
      if (
        e.code === "ArrowRight" ||
        e.code === "KeyD" ||
        e.key === "d" ||
        e.key === "D"
      ) {
        inputRef.current.right = false;
      }
      if (
        e.code === "Space" ||
        e.code === "ArrowUp" ||
        e.code === "KeyW" ||
        e.key === "z" ||
        e.key === "Z"
      ) {
        inputRef.current.jumpHeld = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [resetGame]);

  // Game animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let renderThrottleTimer = 0;

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

      inputRef.current.jumpPressed = false;
      stateRef.current = nextState;

      renderThrottleTimer += dt;
      if (renderThrottleTimer >= 0.016) {
        renderThrottleTimer = 0;
        setGameState(nextState);
      }

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
