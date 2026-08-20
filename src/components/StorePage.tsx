import type { Game } from "../types";
import { useDownload } from "../hooks/useDownload";

interface Props {
  game: Game;
  installed: boolean;
  onInstalled: (id: string) => void;
  wishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  wishlistError: string | null;
}

export default function StorePage({
  game,
  installed,
  onInstalled,
  wishlisted,
  onToggleWishlist,
  wishlistError,
}: Props) {
  const { status, progress, error, start, play } = useDownload(game, installed, onInstalled);
  const shots = game.screenshots && game.screenshots.length > 0
    ? game.screenshots.slice(0, 4)
    : game.coverUrl
    ? [game.coverUrl]
    : [];

  return (
    <div className="store-page">
      <p className="store-eyebrow">Populaires et recommandés</p>

      <div className="store-hero">
        <div className="store-banner">
          <span className="store-banner-badge">Aperçu</span>
          {game.coverUrl && <img src={game.coverUrl} alt="" />}
        </div>

        <div className="store-panel">
          <div className="store-title-row">
            <h1 className="store-title">{game.name}</h1>
            <button
              className={`store-wishlist-btn ${wishlisted ? "is-active" : ""}`}
              onClick={() => {
                console.log("[wishlist] bouton étoile cliqué");
                onToggleWishlist(game.id);
              }}
              title={wishlisted ? "Retirer de la liste de souhaits" : "Ajouter à la liste de souhaits"}
            >
              ★
            </button>
          </div>
          {wishlistError && (
            <p className="status-error" style={{ margin: 0, fontSize: "12px" }}>
              Liste de souhaits : {wishlistError}
            </p>
          )}
          <p className="store-studio">Redline Studios</p>

          <div className="store-thumbs">
            {shots.map((src, i) => (
              <div className="store-thumb" key={i}>
                <img src={src} alt="" />
              </div>
            ))}
            {shots.length === 0 && (
              <div className="store-thumb store-thumb-empty" />
            )}
          </div>

          <div className="store-meta">
            <span>v{game.version}</span>
            <span className="detail-meta-sep">/</span>
            <span>{game.sizeMb} Mo</span>
          </div>

          <div className="store-actions">
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
        </div>
      </div>

      <p className="store-desc">{game.description}</p>
    </div>
  );
}
