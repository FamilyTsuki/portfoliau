import { useCallback, useEffect, useRef, useState } from "react";
import { useAudio } from "@/application/useAudio";
import { useGameEngine } from "@/application/useGameEngine";
import { usePortfolio } from "@/application/usePortfolio";
import { HUD } from "@/presentation/components/hud/HUD";
import { GameCanvas } from "@/presentation/components/game/GameCanvas";
import { PortfolioHome } from "@/presentation/components/portfolio/PortfolioHome";
import { ProjectModal } from "@/presentation/components/portfolio/ProjectModal";
import type { Platform } from "@/domain/game/entities/runner";
import { DEFAULT_PLATFORMS } from "@/domain/game/services/physics";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [platforms, setPlatforms] =
    useState<readonly Platform[]>(DEFAULT_PLATFORMS);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 2000 });

  const { playSound } = useAudio();
  const { profile, projects, selectedProject, setSelectedProject } =
    usePortfolio();

  const { state, setPlatforms: setEnginePlatforms } = useGameEngine({
    onSound: playSound,
    platforms,
    worldWidth: dimensions.width,
    worldHeight: dimensions.height,
  });

  // Mesure dynamique des cartes de texte du DOM comme plateformes physiques
  const measurePlatforms = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      '[data-platform="true"]',
    );

    if (elements.length === 0) return;

    const measured: Platform[] = Array.from(elements).map((el, i) => {
      const rect = el.getBoundingClientRect();
      return {
        id: el.id || `platform-${i}`,
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
      };
    });

    // Sol au bas du conteneur
    measured.push({
      id: "ground",
      x: 0,
      y: containerRect.height - 12,
      width: containerRect.width,
      height: 24,
    });

    setPlatforms(measured);
    setEnginePlatforms(measured);
    setDimensions({
      width: Math.max(800, containerRect.width),
      height: containerRect.height,
    });
  }, [setEnginePlatforms]);

  // Déclencheurs de re-mesure (chargement, polices prêtes, redimensionnement)
  useEffect(() => {
    measurePlatforms();

    const handleResize = () => {
      measurePlatforms();
    };

    window.addEventListener("resize", handleResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(measurePlatforms);
    }

    const ro = new ResizeObserver(() => {
      measurePlatforms();
    });

    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    const timer = setTimeout(measurePlatforms, 120);

    return () => {
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      clearTimeout(timer);
    };
  }, [measurePlatforms]);

  // Suivi de caméra vertical fluide
  useEffect(() => {
    if (!state.runner) return;
    const runnerY = state.runner.y;
    const viewportH = window.innerHeight;
    const scrollY = window.scrollY;

    const targetScrollY = Math.max(0, runnerY - viewportH * 0.4);
    const diff = targetScrollY - scrollY;

    if (Math.abs(diff) > 35) {
      window.scrollTo({
        top: scrollY + diff * 0.16,
        behavior: "auto",
      });
    }
  }, [state.runner.y]);

  return (
    <div className="app">
      <HUD />

      <div className="world-container" ref={containerRef}>
        {/* Calque de jeu transparent sur toute la page (zéro superposition) */}
        <GameCanvas
          state={state}
          width={dimensions.width}
          height={dimensions.height}
        />

        {/* Contenu textuel structuré pour la suite */}
        <main className="container content-flow">
          <PortfolioHome
            profile={profile}
            projects={projects}
            onSelectProject={setSelectedProject}
          />
        </main>
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
