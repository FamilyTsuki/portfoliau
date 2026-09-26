import { useEffect, useRef } from "react";
import {
  GAME_CONSTANTS,
  type GameState,
  type Particle,
  type RunnerState,
} from "@/domain/game/entities/runner";
import { PLAYER_SPRITE_CONFIG } from "@/infrastructure/game/player-sprite-config";

interface GameCanvasProps {
  readonly state: GameState;
  readonly width: number;
  readonly height: number;
}

/**
 * Dessine les particules de poussière avec fondu d'opacité.
 */
function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly Particle[],
) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Rendu pixel art du personnage via la planche d'animation traditionnelle (spritesheet).
 */
function drawSpritesheetPlayer(
  ctx: CanvasRenderingContext2D,
  runner: RunnerState,
  spriteImg: HTMLImageElement,
) {
  const clip = PLAYER_SPRITE_CONFIG.clips[runner.action];
  const fw = PLAYER_SPRITE_CONFIG.frameWidth;
  const fh = PLAYER_SPRITE_CONFIG.frameHeight;
  const sx = runner.frameIndex * fw;
  const sy = clip.row * fh;
  const scale = PLAYER_SPRITE_CONFIG.renderScale;
  const destW = fw * scale;
  const destH = fh * scale;
  const destAnchorX = PLAYER_SPRITE_CONFIG.anchorX * scale;
  const destBaselineY = PLAYER_SPRITE_CONFIG.baselineY * scale;

  const size = GAME_CONSTANTS.playerSize;
  const centerX = runner.x + size / 2;
  const bottomY = runner.y + size;

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(centerX, bottomY);
  if (runner.facing === -1) {
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    spriteImg,
    sx,
    sy,
    fw,
    fh,
    -destAnchorX,
    -destBaselineY,
    destW,
    destH,
  );
  ctx.restore();
}

/**
 * Rendu procédural alternatif (utilisé en cas de délai ou d'échec de chargement de l'image).
 */
function drawProceduralFallback(
  ctx: CanvasRenderingContext2D,
  runner: RunnerState,
) {
  const size = GAME_CONSTANTS.playerSize;
  const centerX = runner.x + size / 2;
  const bottomY = runner.y + size;

  ctx.save();
  ctx.translate(centerX, bottomY);
  ctx.scale(runner.scaleX, runner.scaleY);
  ctx.translate(-centerX, -bottomY);

  const rx = runner.x;
  const ry = runner.y;

  // Corps
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(rx, ry, size, size);

  // Bordure
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(rx, ry, size, size);

  // Yeux
  const eyeX = runner.facing === 1 ? rx + 18 : rx + 8;
  const eyeY = ry + 8;
  ctx.fillStyle = "#000000";
  ctx.fillRect(eyeX, eyeY, 7, 7);

  if (!runner.isBlinking) {
    ctx.fillStyle = "#ffffff";
    const pupilX = runner.facing === 1 ? eyeX + 3 : eyeX + 1;
    ctx.fillRect(pupilX, eyeY + 1, 3, 4);
  }

  // Pattes
  const legFrame = runner.frameIndex % 4;
  const legY = ry + size - 3;
  ctx.fillStyle = "#000000";

  if (runner.action === "run") {
    if (legFrame === 0) {
      ctx.fillRect(rx + 6, legY, 5, 5);
      ctx.fillRect(rx + size - 11, legY - 2, 5, 4);
    } else if (legFrame === 1) {
      ctx.fillRect(rx + 8, legY - 2, 5, 4);
      ctx.fillRect(rx + size - 13, legY, 5, 5);
    } else if (legFrame === 2) {
      ctx.fillRect(rx + 11, legY, 5, 5);
      ctx.fillRect(rx + 5, legY - 2, 5, 4);
    } else {
      ctx.fillRect(rx + 5, legY, 5, 5);
      ctx.fillRect(rx + 13, legY - 2, 5, 4);
    }
  } else if (runner.action === "jump") {
    ctx.fillRect(rx + 6, legY - 2, 6, 3);
    ctx.fillRect(rx + size - 12, legY - 2, 6, 3);
  } else if (runner.action === "fall") {
    ctx.fillRect(rx + 6, legY, 5, 6);
    ctx.fillRect(rx + size - 11, legY, 5, 6);
  } else {
    ctx.fillRect(rx + 7, legY, 5, 4);
    ctx.fillRect(rx + size - 12, legY, 5, 4);
  }

  ctx.restore();
}

export function GameCanvas({ state, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);

  // Préchargement de la spritesheet d'animation
  useEffect(() => {
    if (!PLAYER_SPRITE_CONFIG.useCustomSpritesheet) return;

    const img = new Image();
    img.src = PLAYER_SPRITE_CONFIG.spritesheetUrl;
    img.onload = () => {
      spriteImageRef.current = img;
    };
    img.onerror = () => {
      console.warn(
        "Échec du chargement de la spritesheet, repli procédural actif.",
      );
    };
  }, []);

  // Rendu Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.floor(width * dpr);
    const targetHeight = Math.floor(height * dpr);

    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // 1. Particules
    drawParticles(ctx, state.particles);

    // 2. Personnage
    if (PLAYER_SPRITE_CONFIG.useCustomSpritesheet && spriteImageRef.current) {
      drawSpritesheetPlayer(ctx, state.runner, spriteImageRef.current);
    } else {
      drawProceduralFallback(ctx, state.runner);
    }

    ctx.restore();
  }, [state, width, height]);

  return (
    <div className="game-overlay" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="game-canvas-element"
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    </div>
  );
}
