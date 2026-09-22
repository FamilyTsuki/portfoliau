import type { PlayerAction } from "../entities/runner";
import { PLAYER_SPRITE_CONFIG } from "@/infrastructure/game/player-sprite-config";

export interface AnimationUpdateResult {
  readonly action: PlayerAction;
  readonly frameIndex: number;
  readonly frameTimer: number;
}

export function updateSpriteAnimation(
  isGrounded: boolean,
  justLanded: boolean,
  velocityX: number,
  velocityY: number,
  currentAction: PlayerAction,
  currentFrameIndex: number,
  currentFrameTimer: number,
  deltaSeconds: number,
): AnimationUpdateResult {
  // 1. Determine target action based on physical state
  let targetAction: PlayerAction = "idle";

  if (justLanded) {
    targetAction = "land";
  } else if (!isGrounded) {
    if (currentAction === "jump") {
      // Allow jump ascension to complete its keyframes or reach apex
      if (
        currentFrameIndex < PLAYER_SPRITE_CONFIG.clips.jump.frameCount - 1 &&
        velocityY < 60
      ) {
        targetAction = "jump";
      } else {
        targetAction = "fall";
      }
    } else {
      // In air: if rising sharply (e.g. jump started), play jump; otherwise fall
      targetAction = velocityY < -60 ? "jump" : "fall";
    }
  } else {
    // Grounded: play landing recovery to completion before running or idling
    if (
      currentAction === "land" &&
      currentFrameIndex < PLAYER_SPRITE_CONFIG.clips.land.frameCount - 1
    ) {
      targetAction = "land";
    } else if (Math.abs(velocityX) > 15) {
      targetAction = "run";
    } else {
      targetAction = "idle";
    }
  }

  // 2. If action changed, reset frame counters
  let nextAction = targetAction;
  let nextFrameIndex = currentFrameIndex;
  let nextFrameTimer = currentFrameTimer + deltaSeconds;

  if (targetAction !== currentAction) {
    nextAction = targetAction;
    nextFrameIndex = 0;
    nextFrameTimer = 0;
  }

  // 3. Advance frame based on clip FPS configuration
  const clip = PLAYER_SPRITE_CONFIG.clips[nextAction];
  const frameDuration = 1 / clip.fps;

  if (nextFrameTimer >= frameDuration) {
    nextFrameTimer -= frameDuration;
    nextFrameIndex += 1;

    if (nextFrameIndex >= clip.frameCount) {
      if (clip.loop) {
        nextFrameIndex = 0;
      } else {
        nextFrameIndex = clip.frameCount - 1;
      }
    }
  }

  return {
    action: nextAction,
    frameIndex: nextFrameIndex,
    frameTimer: nextFrameTimer,
  };
}
