import { useState } from 'react';

const CHANNELS = [
  { name: 'Bloomberg', videoId: 'iEpJwprxDdk', ytUrl: 'https://www.youtube.com/@BloombergTelevision/live' },
  { name: 'CNBC', videoId: '9NyxcX3rhQs', ytUrl: 'https://www.youtube.com/@CNBC/live' },
  { name: 'Fox Business', videoId: 'UiV-HNPpHWg', ytUrl: 'https://www.youtube.com/@FoxBusiness/live' },
];

export default function LiveTVPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ch = CHANNELS[activeIdx];

  return (
    <div className="bg-navy-panel rounded-lg border border-gold/15 flex flex-col overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
        <h2 className="text-[11px] font-bold tracking-[1.5px] text-gold uppercase">
          Live TV
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-neg font-semibold animate-pulse">● LIVE</span>
          <span className="text-[9px] text-txt-secondary">{ch.name}</span>
        </div>
      </div>

      {/* Player */}
      <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ch.videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full border-0"
          title={ch.name}
        />
      </div>

      {/* Channel selector */}
      <div className="flex gap-1 p-2 bg-navy-panel border-t border-[#2a3560]">
        {CHANNELS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => setActiveIdx(i)}
            className={`flex-1 text-[10px] font-semibold py-1 px-2 rounded-sm border cursor-pointer font-sans transition-all ${
              i === activeIdx
                ? 'bg-gold/20 text-white border-gold/40'
                : 'bg-[#1a2040] text-txt-secondary border-[#3a4570] hover:bg-[#253157] hover:text-white hover:border-gold/30'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
