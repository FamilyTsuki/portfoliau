import type { PlayerAction } from "@/domain/game/entities/runner";

export interface ClipConfig {
  readonly row: number;
  readonly frameCount: number;
  readonly fps: number;
  readonly loop: boolean;
}

export interface PlayerSpriteConfig {
  /**
   * Passer à true dès que vous ajoutez votre image spritesheet dans le dossier /public !
   */
  readonly useCustomSpritesheet: boolean;

  /**
   * Chemin vers la planche d'animation traditionnelle (ex: "/assets/character_tradi.png")
   */
  readonly spritesheetUrl: string;

  /**
   * Largeur d'une case de frame individuelle dans la spritesheet
   */
  readonly frameWidth: number;

  /**
   * Hauteur d'une case de frame individuelle dans la spritesheet
   */
  readonly frameHeight: number;

  /**
   * Échelle d'affichage du sprite
   */
  readonly renderScale: number;

  /**
   * Définition des animations par action du joueur
   */
  readonly clips: Record<PlayerAction, ClipConfig>;
}

/**
 * CONFIGURATION DE L'ANIMATION TRADITIONNELLE DU JOUEUR
 * =====================================================
 * Pour brancher votre animation dessinée à la main :
 * 1. Placez votre fichier PNG (ex: character_tradi.png) dans le dossier public/ (ou public/assets/)
 * 2. Passez useCustomSpritesheet à `true` ci-dessous
 * 3. Indiquez la largeur/hauteur d'une frame et le nombre d'images par action
 */
export const PLAYER_SPRITE_CONFIG: PlayerSpriteConfig = {
  useCustomSpritesheet: false, // <- Mettre à true dès que l'image est fournie
  spritesheetUrl: "/assets/character_tradi.png",
  frameWidth: 64,
  frameHeight: 64,
  renderScale: 0.8,
  clips: {
    idle: { row: 0, frameCount: 6, fps: 8, loop: true },
    run: { row: 1, frameCount: 8, fps: 12, loop: true },
    jump: { row: 2, frameCount: 4, fps: 12, loop: false },
    fall: { row: 3, frameCount: 4, fps: 12, loop: true },
    land: { row: 4, frameCount: 3, fps: 14, loop: false },
  },
};
