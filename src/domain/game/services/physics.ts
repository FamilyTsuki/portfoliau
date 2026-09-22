import {
  GAME_CONSTANTS,
  type GameState,
  type Particle,
  type Platform,
  type RunnerState,
} from "../entities/runner";
import { updateSpriteAnimation } from "./sprite-animator";

export interface MovementInput {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
}

export type SoundTrigger = "jump" | "land" | "respawn" | "collect" | "victory";

export const DEFAULT_PLATFORMS: readonly Platform[] = [
  { id: "hero", x: 40, y: 140, width: 480, height: 180 },
  { id: "p1", x: 320, y: 440, width: 480, height: 160 },
  { id: "p2", x: 60, y: 720, width: 480, height: 160 },
  { id: "p3", x: 340, y: 1000, width: 480, height: 160 },
  { id: "contact", x: 160, y: 1280, width: 520, height: 180 },
  { id: "ground", x: 0, y: 1600, width: 1200, height: 40 },
];

export const createInitialGameState = (): GameState => ({
  runner: {
    x: GAME_CONSTANTS.startX,
    y: GAME_CONSTANTS.startY,
    velocityX: 0,
    velocityY: 0,
    isGrounded: false,
    facing: 1,
    blinkTimer: 2.5,
    isBlinking: false,
    scaleX: 1,
    scaleY: 1,
    coyoteTime: 0,
    jumpBuffer: 0,
    action: "idle",
    frameIndex: 0,
    frameTimer: 0,
    jumpsRemaining: 2,
  },
  platforms: DEFAULT_PLATFORMS,
  particles: [],
});

let particleCounter = 0;

export const createDustParticles = (
  x: number,
  y: number,
  count = 3,
): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = Math.PI + (Math.random() - 0.5) * 1.5;
    const speed = 25 + Math.random() * 40;
    particles.push({
      id: ++particleCounter,
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * 0.4,
      life: 1,
      maxLife: 0.25 + Math.random() * 0.15,
      size: 2 + Math.random() * 2,
      color: "rgba(255, 255, 255, 0.4)",
    });
  }
  return particles;
};

const overlapsPlatform = (
  x: number,
  playerSize: number,
  platform: Platform,
): boolean => x + playerSize > platform.x && x < platform.x + platform.width;

export const tickPhysics = (
  state: GameState,
  input: MovementInput,
  deltaSeconds: number,
  worldWidth: number,
  worldHeight: number,
  onSound?: (type: SoundTrigger) => void,
): GameState => {
  const dt = Math.min(0.04, Math.max(0.001, deltaSeconds));
  const { runner } = state;

  // 1. Horizontal Direction & Facing
  let dir = 0;
  if (input.left) dir -= 1;
  if (input.right) dir += 1;

  let nextFacing = runner.facing;
  if (dir < 0) nextFacing = -1;
  else if (dir > 0) nextFacing = 1;

  let nextVx = runner.velocityX;
  if (dir !== 0) {
    nextVx += dir * GAME_CONSTANTS.acceleration * dt;
    if (Math.abs(nextVx) > GAME_CONSTANTS.walkSpeed) {
      nextVx = Math.sign(nextVx) * GAME_CONSTANTS.walkSpeed;
    }
  } else {
    if (Math.abs(nextVx) <= GAME_CONSTANTS.friction * dt) {
      nextVx = 0;
    } else {
      nextVx -= Math.sign(nextVx) * GAME_CONSTANTS.friction * dt;
    }
  }

  const maxX = Math.max(800, worldWidth) - GAME_CONSTANTS.playerSize;
  const nextX = Math.max(0, Math.min(maxX, runner.x + nextVx * dt));

  // 2. Jump Buffering & Coyote Time & Double Jump
  let nextJumpBuffer = input.jumpPressed
    ? GAME_CONSTANTS.jumpBufferDuration
    : Math.max(0, runner.jumpBuffer - dt);

  let nextCoyoteTime = runner.isGrounded
    ? GAME_CONSTANTS.coyoteDuration
    : Math.max(0, runner.coyoteTime - dt);

  let nextJumpsRemaining = runner.isGrounded ? 2 : runner.jumpsRemaining;

  const canJumpGround = runner.isGrounded || nextCoyoteTime > 0;
  let nextVy = runner.velocityY;
  let didJump = false;

  if (nextJumpBuffer > 0) {
    if (canJumpGround) {
      nextVy = GAME_CONSTANTS.jumpSpeed;
      nextJumpBuffer = 0;
      nextCoyoteTime = 0;
      nextJumpsRemaining = 1;
      didJump = true;
      onSound?.("jump");
    } else if (nextJumpsRemaining > 0) {
      nextVy = GAME_CONSTANTS.jumpSpeed * 0.95;
      nextJumpBuffer = 0;
      nextJumpsRemaining -= 1;
      didJump = true;
      onSound?.("jump");
    }
  } else {
    if (!input.jumpHeld && nextVy < -200) {
      nextVy *= 0.88;
    }
    nextVy = Math.min(
      GAME_CONSTANTS.maxFallSpeed,
      nextVy + GAME_CONSTANTS.gravity * dt,
    );
  }

  // 3. Platform Collision (landing on the top border of the text block)
  const nextY = runner.y + nextVy * dt;
  const prevBottom = runner.y + GAME_CONSTANTS.playerSize;
  const nextBottom = nextY + GAME_CONSTANTS.playerSize;

  let landingPlatform: Platform | null = null;
  if (nextVy >= 0) {
    for (const p of state.platforms) {
      // Landing window
      if (
        prevBottom <= p.y + 12 &&
        nextBottom >= p.y &&
        overlapsPlatform(nextX, GAME_CONSTANTS.playerSize, p)
      ) {
        landingPlatform = p;
        break;
      }
    }
  }

  const isLanded = Boolean(landingPlatform);
  const justLanded = !runner.isGrounded && isLanded;
  const finalY = landingPlatform
    ? landingPlatform.y - GAME_CONSTANTS.playerSize
    : nextY;

  if (isLanded) {
    nextJumpsRemaining = 2;
  }

  const newParticles: Particle[] = [];
  if (justLanded) {
    onSound?.("land");
    newParticles.push(
      ...createDustParticles(
        nextX + GAME_CONSTANTS.playerSize / 2,
        finalY + GAME_CONSTANTS.playerSize,
        3,
      ),
    );
  }
  if (didJump) {
    newParticles.push(
      ...createDustParticles(
        nextX + GAME_CONSTANTS.playerSize / 2,
        runner.y + GAME_CONSTANTS.playerSize,
        3,
      ),
    );
  }

  // 4. Traditional Animation State Machine
  const animUpdate = updateSpriteAnimation(
    isLanded,
    justLanded,
    nextVx,
    nextVy,
    didJump ? "jump" : runner.action,
    didJump ? 0 : runner.frameIndex,
    didJump ? 0 : runner.frameTimer,
    dt,
  );

  // 5. Squash & Stretch
  let nextScaleX = runner.scaleX;
  let nextScaleY = runner.scaleY;
  if (justLanded) {
    nextScaleX = 1.2;
    nextScaleY = 0.8;
  } else if (didJump) {
    nextScaleX = 0.85;
    nextScaleY = 1.2;
  } else {
    nextScaleX += (1 - nextScaleX) * Math.min(1, dt * 14);
    nextScaleY += (1 - nextScaleY) * Math.min(1, dt * 14);
  }

  // 6. Blinking
  let nextBlinkTimer = runner.blinkTimer - dt;
  let isBlinking = false;
  if (nextBlinkTimer <= 0) {
    isBlinking = true;
    if (nextBlinkTimer < -0.15) {
      nextBlinkTimer = 2.5 + Math.random() * 3.5;
      isBlinking = false;
    }
  }

  // 7. Respawn if fallen past container height
  const bottomThreshold = Math.max(1200, worldHeight + 80);
  let finalRunnerX = nextX;
  let finalRunnerY = finalY;
  let finalVy = landingPlatform ? 0 : nextVy;
  if (finalY > bottomThreshold) {
    const firstPlatform = state.platforms[0];
    finalRunnerX = firstPlatform ? firstPlatform.x + 40 : GAME_CONSTANTS.startX;
    finalRunnerY = firstPlatform
      ? firstPlatform.y - GAME_CONSTANTS.playerSize - 10
      : GAME_CONSTANTS.startY;
    finalVy = 0;
    nextJumpsRemaining = 2;
    onSound?.("respawn");
  }

  const updatedRunner: RunnerState = {
    x: finalRunnerX,
    y: finalRunnerY,
    velocityX: nextVx,
    velocityY: finalVy,
    isGrounded: isLanded,
    facing: nextFacing,
    blinkTimer: nextBlinkTimer,
    isBlinking,
    scaleX: nextScaleX,
    scaleY: nextScaleY,
    coyoteTime: nextCoyoteTime,
    jumpBuffer: nextJumpBuffer,
    jumpsRemaining: nextJumpsRemaining,
    action: animUpdate.action,
    frameIndex: animUpdate.frameIndex,
    frameTimer: animUpdate.frameTimer,
  };

  // 8. Particles Update
  const updatedParticles: Particle[] = [
    ...state.particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        life: p.life - dt / p.maxLife,
      }))
      .filter((p) => p.life > 0),
    ...newParticles,
  ];

  return {
    ...state,
    runner: updatedRunner,
    particles: updatedParticles,
  };
};
