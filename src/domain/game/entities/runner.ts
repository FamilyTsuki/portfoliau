export interface RunnerState {
  readonly y: number;
  readonly velocity: number;
  readonly isGrounded: boolean;
}

export interface GameState {
  readonly runner: RunnerState;
  readonly obstacleX: number;
  readonly score: number;
  readonly isOver: boolean;
}

export const GAME_CONSTANTS = {
  gravity: 0.8,
  jumpVelocity: -13,
  groundY: 0,
  runnerSize: 32,
  obstacleWidth: 22,
  obstacleHeight: 38,
  obstacleSpeed: 6,
  collisionPadding: 5,
} as const;
