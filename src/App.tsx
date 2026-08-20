import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import Sidebar from "./components/Sidebar";
import GameDetail from "./components/GameDetail";
import StorePage from "./components/StorePage";
import ProfileSidebar from "./components/ProfileSidebar";
import SplashScreen from "./components/SplashScreen";
import WishlistPage from "./components/WishlistPage";
import TopBar, { type Page, type StoreFilter } from "./components/TopBar";
import type { Manifest, Game } from "./types";

const MANIFEST_URL = "https://raw.githubusercontent.com/Maxence15-15/Redline-Studios-Game/main/manifest.json";

const FILTER_LABELS: Record<string, string> = {
  recommandations: "Recommandations",
  categories: "Catégories",
  plus: "Plus",
};

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState<Page>("bibliotheque");
  const [storeFilter, setStoreFilter] = useState<StoreFilter>(null);
  const [profileSection, setProfileSection] = useState("Profil");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  useEffect(() => {
    fetch(MANIFEST_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Manifest) => {
        const list = data.games ?? [];
        setGames(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));

    invoke<string[]>("get_wishlist")
      .then((ids) => {
        console.log("[wishlist] chargement initial réussi :", ids);
        setWishlist(new Set(ids));
      })
      .catch((e) => {
        console.error("[wishlist] échec du chargement initial :", e);
        setWishlistError(String(e));
      });
  }, []);

  const toggleWishlist = (id: string) => {
    console.log("[wishlist] clic reçu pour", id);
    invoke<string[]>("toggle_wishlist", { gameId: id })
      .then((ids) => {
        console.log("[wishlist] succès, nouvelle liste :", ids);
        setWishlist(new Set(ids));
        setWishlistError(null);
      })
      .catch((e) => {
        console.error("[wishlist] échec :", e);
        setWishlistError(String(e));
      });
  };

  const filteredGames = search.trim()
    ? games.filter((g) => g.name.toLowerCase().includes(search.trim().toLowerCase()))
    : games;

  const selectedGame =
    filteredGames.find((g) => g.id === selectedId) ?? filteredGames[0] ?? null;

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="app">
      <TopBar
        page={page}
        onNavigate={setPage}
        storeFilter={storeFilter}
        onNavigateFilter={setStoreFilter}
        username="Maxence"
        search={search}
        onSearchChange={setSearch}
        wishlistCount={wishlist.size}
      />

      {page === "communaute" && (
        <div className="placeholder-page">
          <p className="placeholder-title">Communauté</p>
          <p className="placeholder-sub">Bientôt disponible.</p>
        </div>
      )}

      {page === "profil" && (
        <div className="shell">
          <ProfileSidebar active={profileSection} onSelect={setProfileSection} />
          <main className="main">
            <div className="placeholder-page">
              <p className="placeholder-title">{profileSection}</p>
              <p className="placeholder-sub">Bientôt disponible.</p>
            </div>
          </main>
        </div>
      )}

      {page === "wishlist" && (
        <WishlistPage
          games={games.filter((g) => wishlist.has(g.id))}
          onSelectGame={(id) => {
            setSelectedId(id);
            setPage("magasin");
            setStoreFilter(null);
          }}
        />
      )}

      {page === "magasin" && storeFilter && (
        <div className="placeholder-page">
          <p className="placeholder-title">{FILTER_LABELS[storeFilter]}</p>
          <p className="placeholder-sub">Bientôt disponible.</p>
        </div>
      )}

      {page === "magasin" && !storeFilter && (
        <>
          {error && (
            <p className="status-error status-error-full">
              Impossible de charger le catalogue ({error})
            </p>
          )}
          {!error && selectedGame && (
            <StorePage
              game={selectedGame}
              installed={installedIds.has(selectedGame.id)}
              onInstalled={(id) =>
                setInstalledIds((prev) => new Set(prev).add(id))
              }
              wishlisted={wishlist.has(selectedGame.id)}
              onToggleWishlist={toggleWishlist}
              wishlistError={wishlistError}
            />
          )}
          {!error && !selectedGame && (
            <div className="empty-state">
              <p>
                {search.trim()
                  ? "Aucun jeu ne correspond à ta recherche."
                  : "Aucun jeu disponible pour l'instant."}
              </p>
              <p className="empty-sub">Reviens bientôt.</p>
            </div>
          )}
        </>
      )}

      {page === "bibliotheque" && (
        <>
          {error && (
            <p className="status-error status-error-full">
              Impossible de charger le catalogue ({error})
            </p>
          )}
          {!error && (
            <div className="shell">
              <Sidebar
                games={filteredGames}
                selectedId={selectedGame?.id ?? null}
                onSelect={setSelectedId}
                installedIds={installedIds}
              />
              <main className="main">
                {selectedGame ? (
                  <GameDetail
                    key={selectedGame.id}
                    game={selectedGame}
                    installed={installedIds.has(selectedGame.id)}
                    onInstalled={(id) =>
                      setInstalledIds((prev) => new Set(prev).add(id))
                    }
                    wishlisted={wishlist.has(selectedGame.id)}
                    onToggleWishlist={toggleWishlist}
                  />
                ) : (
                  <div className="empty-state">
                    <p>
                      {search.trim()
                        ? "Aucun jeu ne correspond à ta recherche."
                        : "Aucun jeu disponible pour l'instant."}
                    </p>
                    <p className="empty-sub">Reviens bientôt.</p>
                  </div>
                )}
              </main>
            </div>
          )}
        </>
      )}
    </div>
  );
}
