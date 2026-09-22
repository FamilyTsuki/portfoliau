import { useEffect, useRef } from "react";
import { GAME_CONSTANTS, type GameState } from "@/domain/game/entities/runner";
import { PLAYER_SPRITE_CONFIG } from "@/infrastructure/game/player-sprite-config";

interface GameCanvasProps {
  state: GameState;
  width: number;
  height: number;
}

export function GameCanvas({ state, width, height }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spriteImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (PLAYER_SPRITE_CONFIG.useCustomSpritesheet) {
      const img = new Image();
      img.src = PLAYER_SPRITE_CONFIG.spritesheetUrl;
      img.onload = () => {
        spriteImageRef.current = img;
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    if (
      canvas.width !== Math.floor(width * dpr) ||
      canvas.height !== Math.floor(height * dpr)
    ) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    // 1. Zéro superposition : Canvas 100% transparent sur le contenu HTML
    ctx.clearRect(0, 0, width, height);

    // 2. Particules discrètes de saut & atterrissage
    state.particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Personnage Joueur (Prêt pour la planche d'animation traditionnelle)
    const { runner } = state;
    const size = GAME_CONSTANTS.playerSize;
    const centerX = runner.x + size / 2;
    const bottomY = runner.y + size;

    const facing = runner.facing;

    if (PLAYER_SPRITE_CONFIG.useCustomSpritesheet && spriteImageRef.current) {
      // Spritesheet rendering (Animation traditionnelle par cases PNG)
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

      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.translate(centerX, bottomY);
      if (facing === -1) ctx.scale(-1, 1);
      ctx.drawImage(
        spriteImageRef.current,
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
    } else {
      // Rendu minimaliste articulé (en attendant la planche tradi)
      ctx.save();
      ctx.translate(centerX, bottomY);
      ctx.scale(runner.scaleX, runner.scaleY);
      ctx.translate(-centerX, -bottomY);
      const rx = runner.x;
      const ry = runner.y;

      // Corps
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(rx, ry, size, size);

      // Bordure contrastée
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(rx, ry, size, size);

      // Yeux expressifs
      const eyeX = facing === 1 ? rx + 18 : rx + 8;
      const eyeY = ry + 8;
      ctx.fillStyle = "#000000";
      ctx.fillRect(eyeX, eyeY, 7, 7);

      if (!runner.isBlinking) {
        ctx.fillStyle = "#ffffff";
        const pupilX = facing === 1 ? eyeX + 3 : eyeX + 1;
        ctx.fillRect(pupilX, eyeY + 1, 3, 4);
      }

      // Jambes animées
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
    }

    ctx.restore();
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
