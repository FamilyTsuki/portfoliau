import type { Profile, Project } from "@/domain/portfolio/entities/project";

interface PortfolioHomeProps {
  profile: Profile;
  projects: readonly Project[];
  onSelectProject: (project: Project) => void;
}

export function PortfolioHome({
  profile,
  projects,
  onSelectProject,
}: PortfolioHomeProps) {
  return (
    <div className="portfolio-content">
      {/* 01 // HERO */}
      <section
        id="hero"
        className="section hero platform-card platform-card--hero"
        data-platform="true"
      >
        <h1 className="hero__title">{profile.name} — Développeur</h1>
        <p className="hero__bio">{profile.bio}</p>
      </section>

      {/* 02 // PROJETS */}
      <section id="projets" className="section projects">
        <div className="section__header">
          <h2 className="section__title">Projets</h2>
        </div>

        <div className="projects__list">
          {projects.map((project, index) => (
            <article
              key={project.id}
              id={`project-${project.id}`}
              className={`project-card platform-card project-card--${index % 2 === 0 ? "left" : "right"}`}
              data-platform="true"
              onClick={() => onSelectProject(project)}
            >
              <div className="project-card__top">
                <h3 className="project-card__title">{project.title}</h3>
                <span className="project-card__year">{project.year}</span>
              </div>

              <p className="project-card__desc">{project.description}</p>

              <div className="project-card__tags">
                {project.technologies.map((tech) => (
                  <span key={tech} className="tech-tag">
                    {tech}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 03 // CONTACT */}
      <footer
        id="contact"
        className="section contact platform-card platform-card--contact"
        data-platform="true"
      >
        <div className="section__header">
          <h2 className="section__title">Contact</h2>
        </div>

        <a href={`mailto:${profile.email}`} className="contact__email">
          {profile.email} ↗
        </a>

        <div className="contact__links">
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
