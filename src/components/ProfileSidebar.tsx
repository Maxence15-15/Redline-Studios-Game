const ITEMS = [
  "Activité",
  "Profil",
  "Contacts",
  "Groupes",
  "Contenus",
  "Badges",
  "Inventaire",
  "Rétrospective Redline",
];

interface Props {
  active: string;
  onSelect: (item: string) => void;
}

export default function ProfileSidebar({ active, onSelect }: Props) {
  return (
    <nav className="profile-sidebar">
      {ITEMS.map((item) => (
        <button
          key={item}
          className={`profile-sidebar-item ${active === item ? "is-active" : ""}`}
          onClick={() => onSelect(item)}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}
