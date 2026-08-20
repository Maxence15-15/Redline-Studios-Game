import type { Game } from "../types";

interface Props {
  games: Game[];
  onSelectGame: (id: string) => void;
}

export default function WishlistPage({ games, onSelectGame }: Props) {
  if (games.length === 0) {
    return (
      <div className="empty-state">
        <p>Ta liste de souhaits est vide.</p>
        <p className="empty-sub">
          Clique sur l'étoile ★ à côté d'un jeu, dans le Magasin, pour l'ajouter ici.
        </p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <p className="store-eyebrow">Liste de souhaits</p>
      <div className="wishlist-grid">
        {games.map((game) => (
          <button
            key={game.id}
            className="wishlist-tile"
            onClick={() => onSelectGame(game.id)}
          >
            <span className="wishlist-tile-cover">
              {game.coverUrl ? (
                <img src={game.coverUrl} alt="" />
              ) : (
                <span className="sidebar-tile-cover-fallback">
                  {game.name.charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <span className="wishlist-tile-info">
              <span className="wishlist-tile-name">{game.name}</span>
              <span className="wishlist-tile-meta">
                v{game.version} · {game.sizeMb} Mo
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
