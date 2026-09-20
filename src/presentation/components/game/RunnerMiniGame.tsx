"use client";

import { useEffect, useState } from "react";
import {
  createInitialGameState,
  jump,
  tick,
} from "@/domain/game/services/game-engine";

export function RunnerMiniGame() {
  const [game, setGame] = useState(createInitialGameState);

  useEffect(() => {
    const interval = window.setInterval(() => setGame(tick), 32);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        setGame((current) =>
          current.isOver
            ? createInitialGameState()
            : { ...current, runner: jump(current.runner) },
        );
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <section className="game-panel" aria-label="Mini-jeu du portfolio">
      <div className="game-panel__header">
        <div>
          <p className="eyebrow">Pause jouable</p>
          <h2>Traverse mon terrain.</h2>
        </div>
        <span className="score">
          {String(Math.floor(game.score / 10)).padStart(2, "0")}
        </span>
      </div>
      <button
        className={`game-world${game.isOver ? " game-world--over" : ""}`}
        onClick={() =>
          setGame((current) =>
            current.isOver
              ? createInitialGameState()
              : { ...current, runner: jump(current.runner) },
          )
        }
        aria-label={game.isOver ? "Rejouer" : "Faire sauter le personnage"}
      >
        <span className="game-world__hint">
          {game.isOver ? "Rejouer" : "Clique ou espace pour sauter"}
        </span>
        <span
          className="runner"
          style={{ transform: `translateY(${-game.runner.y}px)` }}
        />
        <span
          className="obstacle"
          style={{ transform: `translateX(${game.obstacleX}px)` }}
        />
        <span className="game-world__ground" />
      </button>
    </section>
  );
}
