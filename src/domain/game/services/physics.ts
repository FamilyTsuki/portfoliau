import {
  GAME_CONSTANTS,
  type GameState,
  type Particle,
  type Platform,
  type RunnerState,
} from "../entities/runner";
import { updateSpriteAnimation } from "./sprite-animator";

export interface MovementInput {
  readonly left: boolean;
  readonly right: boolean;
  readonly jumpPressed: boolean;
  readonly jumpHeld: boolean;
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
    jumpsRemaining: GAME_CONSTANTS.maxJumps,
  },
  platforms: DEFAULT_PLATFORMS,
  particles: [],
});

let particleCounter = 0;

/**
 * Génère des particules de poussière semi-transparentes lors d'un saut ou d'un atterrissage.
 */
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

/**
 * Vérifie si la boîte de collision horizontale du joueur intersecte une plateforme.
 */
export const overlapsPlatform = (
  x: number,
  playerSize: number,
  platform: Platform,
): boolean => x + playerSize > platform.x && x < platform.x + platform.width;

/**
 * Calcule le déplacement horizontal (accélération, friction, orientation et limites du monde).
 */
function computeHorizontalMotion(
  runner: RunnerState,
  input: MovementInput,
  dt: number,
  worldWidth: number,
) {
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
    const frictionDecay = GAME_CONSTANTS.friction * dt;
    if (Math.abs(nextVx) <= frictionDecay) {
      nextVx = 0;
    } else {
      nextVx -= Math.sign(nextVx) * frictionDecay;
    }
  }

  const maxX = Math.max(800, worldWidth) - GAME_CONSTANTS.playerSize;
  const nextX = Math.max(0, Math.min(maxX, runner.x + nextVx * dt));

  return { nextVx, nextFacing, nextX };
}

/**
 * Résout le saut (buffer, coyote time, double saut, saut variable) et applique la gravité continue.
 */
function resolveJumpAndGravity(
  runner: RunnerState,
  input: MovementInput,
  dt: number,
  onSound?: (type: SoundTrigger) => void,
) {
  let nextJumpBuffer = input.jumpPressed
    ? GAME_CONSTANTS.jumpBufferDuration
    : Math.max(0, runner.jumpBuffer - dt);

  let nextCoyoteTime = runner.isGrounded
    ? GAME_CONSTANTS.coyoteDuration
    : Math.max(0, runner.coyoteTime - dt);

  let nextJumpsRemaining = runner.isGrounded
    ? GAME_CONSTANTS.maxJumps
    : runner.jumpsRemaining;

  const canJumpGround = runner.isGrounded || nextCoyoteTime > 0;
  let nextVy = runner.velocityY;
  let didJump = false;

  if (nextJumpBuffer > 0) {
    if (canJumpGround) {
      nextVy = GAME_CONSTANTS.jumpSpeed;
      nextJumpBuffer = 0;
      nextCoyoteTime = 0;
      nextJumpsRemaining = GAME_CONSTANTS.maxJumps - 1;
      didJump = true;
      onSound?.("jump");
    } else if (nextJumpsRemaining > 0) {
      nextVy = GAME_CONSTANTS.jumpSpeed * 0.95;
      nextJumpBuffer = 0;
      nextJumpsRemaining -= 1;
      didJump = true;
      onSound?.("jump");
    }
  }

  // Saut variable : écourtage de la vitesse ascensionnelle si relâchement de la touche
  if (!input.jumpHeld && nextVy < -200) {
    nextVy *= 0.88;
  }

  // La gravité s'applique à chaque tick sans interruption (sauf impulsion directe de saut)
  if (!didJump) {
    nextVy = Math.min(
      GAME_CONSTANTS.maxFallSpeed,
      nextVy + GAME_CONSTANTS.gravity * dt,
    );
  }

  return {
    nextVy,
    nextJumpBuffer,
    nextCoyoteTime,
    nextJumpsRemaining,
    didJump,
  };
}

/**
 * Détecte les collisions descendantes avec les plateformes réelles du DOM.
 */
function resolvePlatformCollision(
  runnerY: number,
  nextX: number,
  nextVy: number,
  dt: number,
  platforms: readonly Platform[],
) {
  const nextY = runnerY + nextVy * dt;
  const prevBottom = runnerY + GAME_CONSTANTS.playerSize;
  const nextBottom = nextY + GAME_CONSTANTS.playerSize;

  let landingPlatform: Platform | null = null;
  if (nextVy >= 0) {
    for (const p of platforms) {
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
  const finalY = landingPlatform
    ? landingPlatform.y - GAME_CONSTANTS.playerSize
    : nextY;

  return {
    isLanded,
    landingPlatform,
    finalY,
  };
}

/**
 * Met à jour les déformations d'étirement / écrasement (Squash & Stretch).
 */
function updateSquashAndStretch(
  currentScaleX: number,
  currentScaleY: number,
  justLanded: boolean,
  didJump: boolean,
  dt: number,
) {
  if (justLanded) {
    return { scaleX: 1.2, scaleY: 0.8 };
  }
  if (didJump) {
    return { scaleX: 0.85, scaleY: 1.2 };
  }
  const lerpSpeed = Math.min(1, dt * 14);
  return {
    scaleX: currentScaleX + (1 - currentScaleX) * lerpSpeed,
    scaleY: currentScaleY + (1 - currentScaleY) * lerpSpeed,
  };
}

/**
 * Gère le cycle de clignement des yeux procédural.
 */
function updateBlink(currentBlinkTimer: number, dt: number) {
  let nextBlinkTimer = currentBlinkTimer - dt;
  let isBlinking = false;

  if (nextBlinkTimer <= 0) {
    isBlinking = true;
    if (nextBlinkTimer < -0.15) {
      nextBlinkTimer = 2.5 + Math.random() * 3.5;
      isBlinking = false;
    }
  }

  return { nextBlinkTimer, isBlinking };
}

/**
 * Boucle principale de simulation physique du jeu (60-144 FPS).
 */
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

  // 1. Déplacement horizontal
  const { nextVx, nextFacing, nextX } = computeHorizontalMotion(
    runner,
    input,
    dt,
    worldWidth,
  );

  // 2. Saut & gravité
  const {
    nextVy,
    nextJumpBuffer,
    nextCoyoteTime,
    nextJumpsRemaining: jumpsAfterInput,
    didJump,
  } = resolveJumpAndGravity(runner, input, dt, onSound);

  // 3. Collision plateformes
  const { isLanded, landingPlatform, finalY } = resolvePlatformCollision(
    runner.y,
    nextX,
    nextVy,
    dt,
    state.platforms,
  );

  const justLanded = !runner.isGrounded && isLanded;
  const jumpsRemaining = isLanded ? GAME_CONSTANTS.maxJumps : jumpsAfterInput;

  // 4. Sons et émission de particules de poussière
  const newParticles: Particle[] = [];
  const footX = nextX + GAME_CONSTANTS.playerSize / 2;

  if (justLanded) {
    onSound?.("land");
    newParticles.push(
      ...createDustParticles(footX, finalY + GAME_CONSTANTS.playerSize, 3),
    );
  }
  if (didJump) {
    newParticles.push(
      ...createDustParticles(footX, runner.y + GAME_CONSTANTS.playerSize, 3),
    );
  }

  // 5. Machine à états d'animation (Spritesheet)
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

  // 6. Squash & stretch et clignement
  const { scaleX: nextScaleX, scaleY: nextScaleY } = updateSquashAndStretch(
    runner.scaleX,
    runner.scaleY,
    justLanded,
    didJump,
    dt,
  );
  const { nextBlinkTimer, isBlinking } = updateBlink(runner.blinkTimer, dt);

  // 7. Sécurité de chute dans le vide & respawn
  const bottomThreshold = Math.max(1200, worldHeight + 80);
  let finalRunnerX = nextX;
  let finalRunnerY = finalY;
  let finalRunnerVy = landingPlatform ? 0 : nextVy;
  let finalJumpsRemaining = jumpsRemaining;

  if (finalY > bottomThreshold) {
    const firstPlatform = state.platforms[0];
    finalRunnerX = firstPlatform ? firstPlatform.x + 40 : GAME_CONSTANTS.startX;
    finalRunnerY = firstPlatform
      ? firstPlatform.y - GAME_CONSTANTS.playerSize - 10
      : GAME_CONSTANTS.startY;
    finalRunnerVy = 0;
    finalJumpsRemaining = GAME_CONSTANTS.maxJumps;
    onSound?.("respawn");
  }

  const updatedRunner: RunnerState = {
    x: finalRunnerX,
    y: finalRunnerY,
    velocityX: nextVx,
    velocityY: finalRunnerVy,
    isGrounded: isLanded,
    facing: nextFacing,
    blinkTimer: nextBlinkTimer,
    isBlinking,
    scaleX: nextScaleX,
    scaleY: nextScaleY,
    coyoteTime: nextCoyoteTime,
    jumpBuffer: nextJumpBuffer,
    jumpsRemaining: finalJumpsRemaining,
    action: animUpdate.action,
    frameIndex: animUpdate.frameIndex,
    frameTimer: animUpdate.frameTimer,
  };

  // 8. Mise à jour du cycle de vie des particules
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
