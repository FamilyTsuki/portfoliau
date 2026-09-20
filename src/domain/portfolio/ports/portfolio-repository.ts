import type { Project } from "../entities/project";

export interface PortfolioRepository {
  getProjects(): readonly Project[];
}
