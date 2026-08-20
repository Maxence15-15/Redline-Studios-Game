import type { Game } from "../types";
import { useDownload } from "../hooks/useDownload";

interface Props {
  game: Game;
  installed: boolean;
  onInstalled: (id: string) => void;
  wishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export default function GameDetail({
  game,
  installed,
  onInstalled,
  wishlisted,
  onToggleWishlist,
}: Props) {
  const { status, progress, error, start, play } = useDownload(game, installed, onInstalled);

  return (
    <section className="detail">
      <div className="detail-hero">
        {game.coverUrl && <img src={game.coverUrl} alt="" className="detail-hero-img" />}
        <div className="detail-hero-fade" />
        <div className="detail-hero-stripe" />
        <div className="detail-hero-content">
          <div className="detail-title-row">
            <h1 className="detail-title">{game.name}</h1>
            <button
              className={`detail-wishlist-btn ${wishlisted ? "is-active" : ""}`}
              onClick={() => onToggleWishlist(game.id)}
              title={wishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
              ★
            </button>
          </div>
          <p className="detail-meta">
            <span>v{game.version}</span>
            <span className="detail-meta-sep">/</span>
            <span>{game.sizeMb} Mo</span>
          </p>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-actions">
          {status === "idle" && (
            <button className="btn btn-primary" onClick={start}>
              Télécharger
            </button>
          )}
          {status === "downloading" && (
            <div className="gauge">
              <div className="gauge-track">
                <div className="gauge-fill" style={{ width: `${progress}%` }} />
                <div className="gauge-ticks" />
              </div>
              <span className="gauge-label">{progress}%</span>
            </div>
          )}
          {status === "extracting" && (
            <button className="btn btn-primary" disabled>
              Extraction…
            </button>
          )}
          {status === "ready" && (
            <button className="btn btn-play" onClick={play}>
              ▶ Jouer
            </button>
          )}
          {status === "launching" && (
            <button className="btn btn-play" disabled>
              Lancement…
            </button>
          )}
          {status === "error" && (
            <div className="detail-error">
              <button className="btn btn-primary" onClick={start}>
                Réessayer
              </button>
              <span className="status-error" title={error ?? ""}>
                Échec
              </span>
            </div>
          )}
        </div>

        <p className="detail-desc">{game.description}</p>
      </div>
    </section>
  );
}
