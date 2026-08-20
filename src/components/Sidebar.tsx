import type { Game } from "../types";

interface Props {
  games: Game[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  installedIds: Set<string>;
}

export default function Sidebar({ games, selectedId, onSelect, installedIds }: Props) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">REDLINE</span>
        <span className="sidebar-brand-sub">STUDIOS</span>
      </div>

      <div className="sidebar-section-label">Bibliothèque</div>

      <div className="sidebar-list">
        {games.length === 0 && (
          <p className="sidebar-empty">Aucun jeu pour l'instant.</p>
        )}
        {games.map((game) => (
          <button
            key={game.id}
            className={`sidebar-tile ${selectedId === game.id ? "is-active" : ""}`}
            onClick={() => onSelect(game.id)}
          >
            <span className="sidebar-tile-cover">
              {game.coverUrl ? (
                <img src={game.coverUrl} alt="" />
              ) : (
                <span className="sidebar-tile-cover-fallback">
                  {game.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className={`sidebar-tile-status ${
                  installedIds.has(game.id) ? "is-installed" : ""
                }`}
              />
            </span>
            <span className="sidebar-tile-name">{game.name}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
