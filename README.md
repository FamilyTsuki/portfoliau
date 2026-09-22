# Alban // Portfolio Interactif

Portfolio interactif minimaliste et performant, propulsé par **Vite**, **React 19**, **TypeScript strict** et un **moteur physique 2D fluide** directement intégré sur toute la page (< 70 Ko gzip, zéro dépendance lourde, 60 FPS constant).

---

## Fonctionnalités

### 1. Gameplay sur toute la page (Plateformes textuelles réelles)

- Les blocs de texte du portfolio (`hero`, cartes projets décalées en quinconce, carte contact) sont mesurés dynamiquement dans le DOM et servent de plateformes physiques solides.
- Le joueur explore la page en sautant directement sur les cartes de texte.
- **Double-saut** intégré pour naviguer librement vers le bas comme vers le haut.
- Suivi de caméra vertical automatique et fluide (`window.scrollTo`).

### 2. Zéro superposition & Épuration totale

- Le canvas 2D est un calque 100% transparent (`pointer-events: none`).
- Aucune boîte artificielle ni faux texte superposé : les textes HTML restent parfaitement lisibles, sélectionnables et cliquables (ouverture des modales de projet, liens GitHub/LinkedIn/Email).
- Header épuré : uniquement `Alban` (zéro bouton, zéro pourcentage).
- Aucun collectible ni bouton tactile encombrant.

### 3. Pipeline d'Animation Traditionnelle ("Tradi Ready")

- Le joueur utilise une **machine à états d'animation** (`idle`, `run`, `jump`, `fall`, `land`) avec cadence de frames configurable.
- Configuration centralisée dans [`src/infrastructure/game/player-sprite-config.ts`](file:///home/tsuki/Documents/perso/Projects/portfoliau/src/infrastructure/game/player-sprite-config.ts).
- **Pour brancher vos dessins animés à la main** :
  1. Déposez votre planche PNG dans `public/assets/character_tradi.png`.
  2. Passez `useCustomSpritesheet: true` dans `player-sprite-config.ts`.
  3. Ajustez `frameWidth` et `frameHeight` : le moteur bascule automatiquement sur le rendu de votre animation traditionnelle !
  4. En attendant, un rendu procédural contrasté articulé anime le personnage.

---

## Architecture Propre

```text
src/
├── domain/                      # Métier pur & règles invariables (zéro dépendance externe)
│   ├── game/
│   │   ├── entities/runner.ts   # PlayerAction, RunnerState, Platform, Particle
│   │   └── services/
│   │       ├── physics.ts       # Moteur physique pur 2D (Euler, AABB, double saut)
│   │       └── sprite-animator.ts # Machine à états de l'animation traditionnelle
│   └── portfolio/
│       ├── entities/project.ts  # Project, Profile
│       └── ports/portfolio-repository.ts # Port repository
├── infrastructure/              # Adaptateurs & sources de données
│   ├── game/
│   │   └── player-sprite-config.ts # Configuration planche spritesheet
│   ├── data/portfolio-data.ts   # Données des projets et du profil
│   ├── audio/sound-synth.ts     # Synthétiseur sonore procédural Web Audio API
│   └── portfolio/
│       └── static-portfolio-repository.ts # Implémentation du repository
├── application/                 # Orchestration et hooks
│   ├── useGameEngine.ts         # Boucle RAF, entrées clavier, détection plateformes
│   ├── useAudio.ts              # Audio procédural et état muet
│   └── usePortfolio.ts          # Sélection de projets et profil
└── presentation/                # Rendu React et Canvas
    ├── components/
    │   ├── hud/HUD.tsx          # En-tête épuré
    │   ├── game/GameCanvas.tsx  # Canvas 2D transparent plein écran
    │   └── portfolio/
    │       ├── PortfolioHome.tsx # Blocs de texte marqués pour le moteur physique
    │       └── ProjectModal.tsx  # Fiche détaillée d'un projet
    ├── App.tsx                  # Assemblage & suivi vertical de la caméra
    └── styles.css               # Design tokens sombres minimalistes
```

---

## Commandes

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement local
npm run dev

# Compiler pour la production (TypeScript + Vite)
npm run build

# Linter le code
npm run lint
```

---

## Contrôles

- **Marcher** : `←` `→` ou `Q` `D` (ou `A` `D`)
- **Sauter & Double-sauter** : `Espace` ou `↑` / `Z`
- **Réapparaître au sommet** : Touche `R`
