import {
  GAME_CONSTANTS,
  type GameState,
  type RunnerState,
} from "../entities/runner";

export const createInitialGameState = (): GameState => ({
  runner: { y: GAME_CONSTANTS.groundY, velocity: 0, isGrounded: true },
  obstacleX: 340,
  score: 0,
  isOver: false,
});

export const jump = (runner: RunnerState): RunnerState =>
  runner.isGrounded
    ? { ...runner, velocity: GAME_CONSTANTS.jumpVelocity, isGrounded: false }
    : runner;

export const tick = (state: GameState): GameState => {
  if (state.isOver) return state;

  const nextVelocity = state.runner.velocity + GAME_CONSTANTS.gravity;
  const nextY = state.runner.y + nextVelocity;
  const isGrounded = nextY >= GAME_CONSTANTS.groundY;
  const runner = {
    y: isGrounded ? GAME_CONSTANTS.groundY : nextY,
    velocity: isGrounded ? 0 : nextVelocity,
    isGrounded,
  };
  const obstacleX = state.obstacleX - GAME_CONSTANTS.obstacleSpeed;
  const nextObstacleX =
    obstacleX < -GAME_CONSTANTS.obstacleWidth ? 340 : obstacleX;
  const runnerRight =
    64 + GAME_CONSTANTS.runnerSize - GAME_CONSTANTS.collisionPadding;
  const obstacleLeft = obstacleX + GAME_CONSTANTS.collisionPadding;
  const obstacleRight =
    obstacleX + GAME_CONSTANTS.obstacleWidth - GAME_CONSTANTS.collisionPadding;
  const runnerBottom = GAME_CONSTANTS.groundY - runner.y;
  const hasCollision =
    obstacleLeft < runnerRight &&
    obstacleRight > 64 + GAME_CONSTANTS.collisionPadding &&
    runnerBottom < GAME_CONSTANTS.obstacleHeight;

  return {
    runner,
    obstacleX: nextObstacleX,
    score: state.score + 1,
    isOver: hasCollision,
  };
};
