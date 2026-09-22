import type { Profile, Project } from "@/domain/portfolio/entities/project";
import type { PortfolioRepository } from "@/domain/portfolio/ports/portfolio-repository";
import { PROFILE_DATA, PROJECTS_DATA } from "../data/portfolio-data";

export class StaticPortfolioRepository implements PortfolioRepository {
  getProjects(): readonly Project[] {
    return PROJECTS_DATA;
  }

  getProfile(): Profile {
    return PROFILE_DATA;
  }
}

export const portfolioRepository = new StaticPortfolioRepository();
