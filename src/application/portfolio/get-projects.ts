import type { Project } from "@/domain/portfolio/entities/project";
import type { PortfolioRepository } from "@/domain/portfolio/ports/portfolio-repository";

export const getProjects = (
  repository: PortfolioRepository,
): readonly Project[] => repository.getProjects();
