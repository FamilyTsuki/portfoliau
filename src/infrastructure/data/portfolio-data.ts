import type { Profile, Project } from "@/domain/portfolio/entities/project";

export const PROFILE_DATA: Profile = {
  name: "Alban",
  title: "Creative Technologist & Software Craftsman",
  eyebrow: "SYSTEMS_ARCHITECT // CREATIVE_ENGINEER",
  bio: "Spécialiste de l'ingénierie web haute performance et du creative coding. Conception de systèmes logiciels robustes couplés à des expériences interactives fluides à 60 FPS.",
  location: "Paris / Remote",
  email: "alban.elie590@gmail.com",
  availableForFreelance: true,
  github: "https://github.com/FamilyTsuki",
  linkedin: "https://linkedin.com",
};

export const PROJECTS_DATA: readonly Project[] = [
  {
    id: "atelier-numerique",
    number: "01",
    title: "Atelier Numérique",
    subtitle: "Architecture micro-frontend & moteur de catalogue virtuel",
    description:
      "Plateforme éditoriale et catalogue dynamique à fort trafic avec transitions d'états fluides et rendu visuel temps réel.",
    longDescription:
      "Conception architecturale découplée (Domain-Driven Design). Remplacement d'un socle monolithique par des modules typés avec state machines. Algorithme de filtrage multidimensionnel à latence sub-milliseconde et préchargement prédictif des ressources graphiques.",
    role: "Lead Software Architect & Creative Developer",
    technologies: [
      "TypeScript",
      "React 19",
      "State Machine",
      "Clean Architecture",
      "Vite",
    ],
    year: 2026,
    status: "featured",
    metrics: "+140% d'engagement · 99 Lighthouse · Zéro layout shift (CLS = 0)",
    demoUrl: "https://example.com/atelier-numerique",
    githubUrl: "https://github.com/FamilyTsuki/portfoliau",
  },
  {
    id: "signal-local",
    number: "02",
    title: "Signal Local",
    subtitle: "Moteur de cartographie sensible & rendu vectoriel spatialisé",
    description:
      "Dashboard de visualisation de données géospatiales traitant des flux volumineux avec une boucle de rendu fluide à 60 FPS.",
    longDescription:
      "Implémentation d'un index spatial de type QuadTree / R-Tree en TypeScript pur pour interroger 50 000+ points sans latence. Rendu Canvas 2D par batching de primitives géométriques sans la surcharge mémoire d'un moteur WebGL tiers.",
    role: "Performance Engineer & Data Visualizer",
    technologies: [
      "Spatial Indexing (QuadTree)",
      "Canvas 2D",
      "GeoJSON",
      "TypeScript Strict",
    ],
    year: 2025,
    status: "featured",
    metrics: "60 FPS stable sur smartphone · Empreinte mémoire < 12 Mo",
    demoUrl: "https://example.com/signal-local",
    githubUrl: "https://github.com/FamilyTsuki/portfoliau",
  },
  {
    id: "murmures",
    number: "03",
    title: "Murmures Studio",
    subtitle: "Maison d'édition interactive & synthèse audio procédurale",
    description:
      "Identité numérique expérimentale intégrant une synthèse sonore temps réel Web Audio API synchronisée avec le défilement.",
    longDescription:
      "Création d'un graphe de nœuds audio numériques (BiquadFilter, GainNodes, Convolver) générant des textures sonores dynamiques selon la vitesse de navigation de l'utilisateur. Aucune piste audio préenregistrée : zéro bande passante réseau consommée pour le son.",
    role: "Creative Technologist & Audio DSP Engineer",
    technologies: [
      "Web Audio API DSP",
      "Procedural Sound",
      "CSS Grid Matrix",
      "Creative Coding",
    ],
    year: 2024,
    status: "featured",
    metrics: "Mention Spéciale Awwwards & FWA · Empreinte carbone éco-conçue",
    demoUrl: "https://example.com/murmures",
    githubUrl: "https://github.com/FamilyTsuki/portfoliau",
  },
];
