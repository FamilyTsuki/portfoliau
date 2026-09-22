import type { PlayerAction } from "@/domain/game/entities/runner";

export interface ClipConfig {
  readonly row: number;
  readonly frameCount: number;
  readonly fps: number;
  readonly loop: boolean;
}

export interface PlayerSpriteConfig {
  readonly useCustomSpritesheet: boolean;
  readonly spritesheetUrl: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly baselineY: number;
  readonly anchorX: number;
  readonly renderScale: number;
  readonly clips: Record<PlayerAction, ClipConfig>;
}

/**
 * CONFIGURATION DE L'ANIMATION DU JOUEUR (HORNET - SILKSONG)
 * ==========================================================
 * Spritesheet officiel Team Cherry (orienté vers la droite par défaut) :
 * - "/assets/character_tradi.png" -> Hornet Silksong Original (Cape bordeaux officielle)
 */
export const PLAYER_SPRITE_CONFIG: PlayerSpriteConfig = {
  useCustomSpritesheet: true,
  spritesheetUrl: "/assets/character_tradi.png?v=3",
  frameWidth: 128,
  frameHeight: 128,
  baselineY: 120,
  anchorX: 64,
  renderScale: 0.44,
  clips: {
    idle: { row: 0, frameCount: 6, fps: 8, loop: true },
    run: { row: 1, frameCount: 8, fps: 12, loop: true },
    jump: { row: 2, frameCount: 8, fps: 14, loop: false },
    fall: { row: 3, frameCount: 6, fps: 8, loop: true },
    land: { row: 4, frameCount: 4, fps: 12, loop: false },
  },
};
