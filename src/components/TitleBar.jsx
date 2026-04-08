import { useState, useEffect } from 'react';

const portals = [
  { label: 'Energy', href: 'https://media-dashboards.vercel.app/energy/' },
  { label: 'Cleantech', href: 'https://media-dashboards.vercel.app/cleantech/' },
  { label: 'Media', href: 'https://media-dashboards.vercel.app/media/' },
  { label: 'PB', href: 'https://media-dashboards.vercel.app/private-banking/' },
  { label: 'Hormuz', href: 'https://media-dashboards.vercel.app/hormuz/' },
];

function Clock() {
  const [time, setTime] = useState('--:-- --');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-gold font-semibold text-sm">{time}</span>;
}

export default function TitleBar({ onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    if (onRefresh) await onRefresh();
    setLoading(false);
  }

  return (
    <div className="bg-navy border-b-[3px] border-gold px-5 py-2 flex items-center justify-between gap-4">
      {/* Title — clickable as HOME */}
      <a href="https://media-dashboards.vercel.app/" className="flex-shrink-0 hover:opacity-80 transition-opacity">
        <div className="text-[16px] font-bold tracking-[2px] text-white uppercase">
          M&A <span className="text-gold">Intelligence</span> Monitor
        </div>
      </a>

      {/* Portal links — center */}
      <div className="hidden md:flex items-center gap-1 text-[10px] flex-shrink-0">
        {portals.map((p, i) => (
          <span key={p.label} className="flex items-center">
            {i > 0 && <span className="text-white/15 mx-1">|</span>}
            <a
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-txt-secondary hover:text-gold transition-colors whitespace-nowrap"
            >
              {p.label}
            </a>
          </span>
        ))}
      </div>

      {/* Clock + Refresh */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Clock />
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-navy-panel border border-gold text-gold text-[10px] px-2.5 py-1 rounded-sm tracking-wide cursor-pointer font-sans hover:bg-gold hover:text-navy transition-all disabled:opacity-50"
        >
          {loading ? '↻ ...' : '↻ REFRESH'}
        </button>
      </div>
    </div>
  );
}
