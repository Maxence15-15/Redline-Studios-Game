export default function BrowseMenu() {
  return (
    <div className="browse-menu">
      <div className="browse-col browse-nav">
        <button className="browse-nav-item">
          <span className="browse-nav-title">Accueil</span>
        </button>
        <button className="browse-nav-item">
          <span className="browse-nav-title">Nouveautés</span>
          <span className="browse-nav-sub">Découvrez les derniers ajouts au catalogue</span>
        </button>
        <button className="browse-nav-item">
          <span className="browse-nav-title">Prochaines sorties</span>
          <span className="browse-nav-sub">Consulte le calendrier des sorties</span>
        </button>
        <button className="browse-nav-item">
          <span className="browse-nav-title">Tous les classements et statistiques</span>
          <span className="browse-nav-sub">Parcours les jeux les plus téléchargés</span>
        </button>
      </div>

      <div className="browse-col browse-promos">
        <div className="browse-promo browse-promo-a">
          <span>Meilleures ventes</span>
        </div>
        <div className="browse-promo browse-promo-b">
          <span>Promotions et évènements</span>
        </div>
      </div>

      <div className="browse-col browse-links">
        <p className="browse-links-label">Pages les plus populaires</p>
        <button className="browse-link">Free-to-play</button>
        <button className="browse-link">Démos</button>
        <button className="browse-link">Actualités et mises à jour</button>
        <button className="browse-link">Cartes-cadeaux</button>
      </div>

      <div className="browse-col browse-links">
        <p className="browse-links-label">Mon compte</p>
        <button className="browse-link">Mes préférences</button>
        <button className="browse-link">Ma liste de souhaits</button>
        <button className="browse-link">Ma famille</button>
      </div>
    </div>
  );
}
