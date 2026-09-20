import type { Project } from "@/domain/portfolio/entities/project";
import { RunnerMiniGame } from "@/presentation/components/game/RunnerMiniGame";

interface PortfolioHomeProps {
  projects: readonly Project[];
}

export function PortfolioHome({ projects }: PortfolioHomeProps) {
  return (
    <main>
      <nav className="site-nav" aria-label="Navigation principale">
        <span className="brand">A / portfolio</span>
        <div className="site-nav__links">
          <a href="#projets">Projets</a>
          <a href="#a-propos">À propos</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section className="hero" id="a-propos">
        <p className="eyebrow">
          Designer développeur indépendant · Paris / partout
        </p>
        <h1>
          Je fabrique des expériences numériques qui donnent envie
          d&apos;avancer.
        </h1>
        <div className="hero__footer">
          <p>
            Identités, interfaces et produits web avec une attention
            particulière pour les détails qui font rester.
          </p>
          <span className="hero__mark">01 / 04</span>
        </div>
      </section>

      <section className="work" id="projets">
        <div className="section-heading">
          <p className="eyebrow">Sélection récente</p>
          <p className="section-heading__count">{projects.length} projets</p>
        </div>
        <div className="project-list">
          {projects.map((project, index) => (
            <article className="project-row" key={project.id}>
              <span className="project-row__number">0{index + 1}</span>
              <div className="project-row__main">
                <h2>{project.title}</h2>
                <p>{project.description}</p>
              </div>
              <div className="project-row__meta">
                <span>{project.technologies.join(" · ")}</span>
                <span>{project.year}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <RunnerMiniGame />

      <footer className="site-footer" id="contact">
        <p className="eyebrow">Un projet en tête ?</p>
        <a href="mailto:hello@example.com">hello@example.com ↗</a>
        <span>© 2026 — A.</span>
      </footer>
    </main>
  );
}
