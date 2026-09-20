import { getProjects } from "@/application/portfolio/get-projects";
import { StaticPortfolioRepository } from "@/infrastructure/portfolio/static-portfolio-repository";
import { PortfolioHome } from "@/presentation/components/portfolio/PortfolioHome";

export default function Home() {
  const repository = new StaticPortfolioRepository();
  return <PortfolioHome projects={getProjects(repository)} />;
}
