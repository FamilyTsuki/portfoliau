import {
  PLAYER_ANIMATION_CLIPS,
  type PlayerAction,
  type SpriteClip,
} from "../entities/runner";

export interface AnimationUpdateResult {
  readonly action: PlayerAction;
  readonly frameIndex: number;
  readonly frameTimer: number;
}

/**
 * Machine à états d'animation du joueur :
 * Détermine l'action appropriée (idle, run, jump, fall, land)
 * et avance le timer de frame selon le taux de rafraîchissement (fps) du clip.
 */
export function updateSpriteAnimation(
  isGrounded: boolean,
  justLanded: boolean,
  velocityX: number,
  velocityY: number,
  currentAction: PlayerAction,
  currentFrameIndex: number,
  currentFrameTimer: number,
  deltaSeconds: number,
  clips: Record<PlayerAction, SpriteClip> = PLAYER_ANIMATION_CLIPS,
): AnimationUpdateResult {
  // 1. Détermination de l'action cible selon l'état physique
  let targetAction: PlayerAction = "idle";

  if (justLanded) {
    targetAction = "land";
  } else if (!isGrounded) {
    if (currentAction === "jump") {
      // Maintient l'ascension du saut jusqu'à la fin des frames ou au sommet de la trajectoire
      const isAscending = velocityY < 60;
      const hasRemainingFrames = currentFrameIndex < clips.jump.frameCount - 1;

      targetAction = isAscending && hasRemainingFrames ? "jump" : "fall";
    } else {
      // En l'air : impulsion vers le haut = saut, sinon chute
      targetAction = velocityY < -60 ? "jump" : "fall";
    }
  } else {
    // Au sol : jouer l'animation d'atterrissage complète avant de courir ou d'attendre
    const isPlayingLand =
      currentAction === "land" && currentFrameIndex < clips.land.frameCount - 1;

    if (isPlayingLand) {
      targetAction = "land";
    } else if (Math.abs(velocityX) > 15) {
      targetAction = "run";
    } else {
      targetAction = "idle";
    }
  }

  // 2. Si l'action change, réinitialisation des compteurs de frame
  let nextAction = targetAction;
  let nextFrameIndex = currentFrameIndex;
  let nextFrameTimer = currentFrameTimer + deltaSeconds;

  if (targetAction !== currentAction) {
    nextAction = targetAction;
    nextFrameIndex = 0;
    nextFrameTimer = 0;
  }

  // 3. Avancement de la frame selon le FPS configuré pour le clip
  const clip = clips[nextAction];
  const frameDuration = 1 / clip.fps;

  if (nextFrameTimer >= frameDuration) {
    nextFrameTimer -= frameDuration;
    nextFrameIndex += 1;

    if (nextFrameIndex >= clip.frameCount) {
      nextFrameIndex = clip.loop ? 0 : clip.frameCount - 1;
    }
  }

  return {
    action: nextAction,
    frameIndex: nextFrameIndex,
    frameTimer: nextFrameTimer,
  };
}
