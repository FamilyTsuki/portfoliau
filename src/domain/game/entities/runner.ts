export type PlayerAction = "idle" | "run" | "jump" | "fall" | "land";

export interface RunnerState {
  readonly x: number;
  readonly y: number;
  readonly velocityX: number;
  readonly velocityY: number;
  readonly isGrounded: boolean;
  readonly facing: 1 | -1;
  readonly blinkTimer: number;
  readonly isBlinking: boolean;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly coyoteTime: number;
  readonly jumpBuffer: number;
  // Traditional animation support (frame-by-frame spritesheet ready)
  readonly action: PlayerAction;
  readonly frameIndex: number;
  readonly frameTimer: number;
  readonly jumpsRemaining: number;
}

export interface Platform {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface Particle {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly vx: number;
  readonly vy: number;
  readonly life: number;
  readonly maxLife: number;
  readonly size: number;
  readonly color: string;
}

export interface GameState {
  readonly runner: RunnerState;
  readonly platforms: readonly Platform[];
  readonly particles: readonly Particle[];
}

export interface SpriteClip {
  readonly row: number;
  readonly frameCount: number;
  readonly fps: number;
  readonly loop: boolean;
}

export const PLAYER_ANIMATION_CLIPS: Record<PlayerAction, SpriteClip> = {
  idle: { row: 0, frameCount: 8, fps: 8, loop: true },
  run: { row: 1, frameCount: 10, fps: 12, loop: true },
  jump: { row: 2, frameCount: 4, fps: 8, loop: false },
  fall: { row: 3, frameCount: 4, fps: 8, loop: true },
  land: { row: 4, frameCount: 4, fps: 12, loop: false },
};

export const GAME_CONSTANTS = {
  playerSize: 34,
  walkSpeed: 320,
  acceleration: 2200,
  friction: 1800,
  gravity: 1500,
  jumpSpeed: -650,
  maxFallSpeed: 950,
  maxJumps: 2,
  coyoteDuration: 0.12,
  jumpBufferDuration: 0.15,
  startX: 80,
  startY: 40,
} as const;
