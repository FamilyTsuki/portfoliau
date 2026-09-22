import type { Profile, Project } from "../entities/project";

export interface PortfolioRepository {
  getProjects(): readonly Project[];
  getProfile(): Profile;
}
