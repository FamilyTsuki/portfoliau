# A / portfolio

Portfolio personnel construit avec Next.js, TypeScript et une architecture en couches. La page contient un mini-jeu de course : le personnage saute au clic, avec `Espace` ou `Fleche haut`.

## Arborescence

```text
src/
├── app/                    # Composition Next.js, layout, metadata et styles globaux
├── domain/                 # Regles metier pures, sans React ni acces externe
│   ├── game/               # Entites et moteur du mini-jeu
│   └── portfolio/          # Entites et ports du portfolio
├── application/            # Cas d'utilisation et orchestration
├── infrastructure/        # Implementations concretes des ports
└── presentation/           # Composants React et experience utilisateur
    └── components/
        ├── game/
        └── portfolio/
```

## Principes

- **SOLID** : les responsabilites sont separees et les dependances passent par des interfaces (`PortfolioRepository`).
- **Architecture hexagonale legere** : le domaine ne depend pas de Next.js ; l'infrastructure peut remplacer les donnees statiques par une API ou une base de donnees.
- **Presentation independante** : les composants React recoivent leurs donnees et ne connaissent pas le stockage.
- **Jeu testable** : la gravite, le saut, le score et les collisions sont dans `domain/game/services/game-engine.ts`, sans dependance au navigateur.

## Commandes

```bash
npm run dev      # serveur local
npm run lint     # verification ESLint
npm run build    # compilation de production
```
