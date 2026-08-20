import { useState } from "react";
import BrowseMenu from "./BrowseMenu";

export type Page = "magasin" | "bibliotheque" | "communaute" | "profil" | "wishlist";

export type StoreFilter = "recommandations" | "categories" | "plus" | null;

interface Props {
  page: Page;
  onNavigate: (page: Page) => void;
  storeFilter: StoreFilter;
  onNavigateFilter: (filter: StoreFilter) => void;
  username: string;
  search: string;
  onSearchChange: (value: string) => void;
  wishlistCount: number;
}

const TABS: { id: Page; label: string }[] = [
  { id: "magasin", label: "Magasin" },
  { id: "bibliotheque", label: "Bibliothèque" },
  { id: "communaute", label: "Communauté" },
];

const FILTERS: { id: StoreFilter; label: string }[] = [
  { id: "recommandations", label: "Recommandations" },
  { id: "categories", label: "Catégories" },
  { id: "plus", label: "Plus" },
];

export default function TopBar({
  page,
  onNavigate,
  storeFilter,
  onNavigateFilter,
  username,
  search,
  onSearchChange,
  wishlistCount,
}: Props) {
  const [browseOpen, setBrowseOpen] = useState(false);

  const closeBrowse = () => setBrowseOpen(false);

  return (
    <div className="topbar">
      <nav className="topbar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`topbar-tab ${page === tab.id ? "is-active" : ""}`}
            onClick={() => {
              onNavigate(tab.id);
              onNavigateFilter(null);
              closeBrowse();
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          className={`topbar-tab topbar-tab-user ${page === "profil" ? "is-active" : ""}`}
          onClick={() => {
            onNavigate("profil");
            closeBrowse();
          }}
        >
          {username}
        </button>
      </nav>

      <div className="topbar-sub">
        <div className="topbar-filters">
          <button
            className={`topbar-filter ${browseOpen ? "is-active" : ""}`}
            onClick={() => setBrowseOpen((v) => !v)}
          >
            Parcourir
            <span className="topbar-filter-caret">▾</span>
          </button>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`topbar-filter ${storeFilter === f.id ? "is-active" : ""}`}
              onClick={() => {
                onNavigate("magasin");
                onNavigateFilter(f.id);
                closeBrowse();
              }}
            >
              {f.label}
              <span className="topbar-filter-caret">▾</span>
            </button>
          ))}
        </div>

        <div className="topbar-sub-right">
          <div className="topbar-search">
            <input
              type="text"
              placeholder="Rechercher dans le catalogue"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="topbar-search-icon">⌕</span>
          </div>
          <button
            className={`topbar-wishlist ${page === "wishlist" ? "is-active" : ""}`}
            onClick={() => {
              onNavigate("wishlist");
              closeBrowse();
            }}
          >
            <span className="topbar-wishlist-star">★</span>
            Liste de souhaits
            {wishlistCount > 0 && (
              <span className="topbar-wishlist-count">{wishlistCount}</span>
            )}
          </button>
        </div>
      </div>

      {browseOpen && (
        <>
          <div className="browse-backdrop" onClick={closeBrowse} />
          <BrowseMenu />
        </>
      )}
    </div>
  );
}
