import type { Project } from "@/domain/portfolio/entities/project";
import type { PortfolioRepository } from "@/domain/portfolio/ports/portfolio-repository";

const projects: readonly Project[] = [
  {
    id: "atelier-numerique",
    title: "Atelier numérique",
    description:
      "Une expérience éditoriale qui transforme un catalogue en parcours vivant.",
    technologies: ["Next.js", "TypeScript", "Design system"],
    year: 2026,
    status: "featured",
  },
  {
    id: "signal-local",
    title: "Signal local",
    description: "Un outil calme pour comprendre les données d'un territoire.",
    technologies: ["React", "Data viz", "UX research"],
    year: 2025,
    status: "featured",
  },
  {
    id: "murmures",
    title: "Murmures",
    description:
      "Une identité visuelle et numérique pour une maison indépendante.",
    technologies: ["Branding", "Web", "Motion"],
    year: 2024,
    status: "archive",
  },
];

export class StaticPortfolioRepository implements PortfolioRepository {
  getProjects(): readonly Project[] {
    return projects;
  }
}
