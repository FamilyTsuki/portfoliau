import { useState, useMemo } from "react";
import type { Project } from "@/domain/portfolio/entities/project";
import { portfolioRepository } from "@/infrastructure/portfolio/static-portfolio-repository";

export function usePortfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects = useMemo(() => portfolioRepository.getProjects(), []);
  const profile = useMemo(() => portfolioRepository.getProfile(), []);

  return {
    projects,
    profile,
    selectedProject,
    setSelectedProject,
  };
}
