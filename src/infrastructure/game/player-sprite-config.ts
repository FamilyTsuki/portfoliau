import {
  PLAYER_ANIMATION_CLIPS,
  type PlayerAction,
  type SpriteClip,
} from "@/domain/game/entities/runner";

export type ClipConfig = SpriteClip;

export interface PlayerSpriteConfig {
  readonly useCustomSpritesheet: boolean;
  readonly spritesheetUrl: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly baselineY: number;
  readonly anchorX: number;
  readonly renderScale: number;
  readonly clips: Record<PlayerAction, SpriteClip>;
}

export const PLAYER_SPRITE_CONFIG: PlayerSpriteConfig = {
  useCustomSpritesheet: true,
  spritesheetUrl: "/assets/character_tradi.png?v=5-cat",
  frameWidth: 128,
  frameHeight: 128,
  baselineY: 112,
  anchorX: 64,
  renderScale: 0.5,
  clips: PLAYER_ANIMATION_CLIPS,
};
