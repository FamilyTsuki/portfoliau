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

export const PLAYER_SPRITE_CONFIG: PlayerSpriteConfig = {
  useCustomSpritesheet: true,
  spritesheetUrl: "/assets/character_tradi.png?v=5-cat",
  frameWidth: 128,
  frameHeight: 128,
  baselineY: 112,
  anchorX: 64,
  renderScale: 0.5,
  clips: {
    idle: { row: 0, frameCount: 8, fps: 8, loop: true },
    run: { row: 1, frameCount: 10, fps: 12, loop: true },
    jump: { row: 2, frameCount: 4, fps: 8, loop: false },
    fall: { row: 3, frameCount: 4, fps: 8, loop: true },
    land: { row: 4, frameCount: 4, fps: 12, loop: false },
  },
};
