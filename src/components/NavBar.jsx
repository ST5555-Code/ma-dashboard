const portals = [
  { label: 'Energy', href: 'https://media-dashboards.vercel.app/energy/' },
  { label: 'Cleantech', href: 'https://media-dashboards.vercel.app/cleantech/' },
  { label: 'Media', href: 'https://media-dashboards.vercel.app/media/' },
  { label: 'Private Banking', href: 'https://media-dashboards.vercel.app/private-banking/' },
  { label: 'Hormuz', href: 'https://media-dashboards.vercel.app/hormuz/' },
];

export default function NavBar() {
  return (
    <div className="bg-[#0a0a0a] border-b border-[#2a2a2a] px-4 py-1.5 flex items-center gap-2 text-[11px]">
      <a
        href="https://media-dashboards.vercel.app/"
        className="text-gold font-bold tracking-widest px-2.5 py-1 border border-gold rounded-sm hover:bg-gold hover:text-navy transition-colors"
      >
        HOME
      </a>
      <span className="text-[#333]">|</span>
      {portals.map((p) => (
        <a
          key={p.label}
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#aaa] px-2.5 py-1 border border-[#333] rounded-sm hover:text-white transition-colors"
        >
          {p.label} ↗
        </a>
      ))}
    </div>
  );
}
