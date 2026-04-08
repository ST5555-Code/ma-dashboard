import { useState, useCallback } from 'react';
import { Rnd } from 'react-rnd';

const CHANNELS = [
  { name: 'Bloomberg', videoId: 'iEpJwprxDdk', ytUrl: 'https://www.youtube.com/@BloombergTelevision/live' },
  { name: 'CNBC', videoId: '9NyxcX3rhQs', ytUrl: 'https://www.youtube.com/@CNBC/live' },
  { name: 'Fox Business', videoId: 'UiV-HNPpHWg', ytUrl: 'https://www.youtube.com/@FoxBusiness/live' },
];

function TVContent({ activeIdx, setActiveIdx, isFloating, onToggleFloat, onMinimize }) {
  const ch = CHANNELS[activeIdx];

  return (
    <div className="bg-navy-panel rounded-lg border border-gold/15 flex flex-col overflow-hidden h-full">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
        <h2 className="text-[11px] font-bold tracking-[1.5px] text-gold uppercase">
          Live TV
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-neg font-semibold animate-pulse">● LIVE</span>
          <span className="text-[9px] text-txt-secondary">{ch.name}</span>
          {/* Float/Dock button — desktop only */}
          <button
            onClick={onToggleFloat}
            className="hidden xl:inline-block text-[8px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
          >
            {isFloating ? 'DOCK' : 'FLOAT'}
          </button>
          {isFloating && (
            <button
              onClick={onMinimize}
              className="text-[8px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
            >
              MIN
            </button>
          )}
        </div>
      </div>

      {/* Player */}
      <div className="relative w-full bg-black flex-1" style={{ minHeight: isFloating ? 0 : undefined, paddingTop: isFloating ? 0 : '56.25%' }}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${ch.videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={isFloating ? 'w-full h-full border-0' : 'absolute top-0 left-0 w-full h-full border-0'}
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

export default function LiveTVPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [floating, setFloating] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const toggleFloat = useCallback(() => {
    setFloating(f => !f);
    setMinimized(false);
  }, []);

  // Docked mode
  if (!floating) {
    return (
      <TVContent
        activeIdx={activeIdx}
        setActiveIdx={setActiveIdx}
        isFloating={false}
        onToggleFloat={toggleFloat}
        onMinimize={() => {}}
      />
    );
  }

  // Minimized floating
  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[2000]">
        <button
          onClick={() => setMinimized(false)}
          className="bg-navy-panel border border-gold/30 text-gold text-[10px] px-3 py-2 rounded shadow-lg hover:bg-gold/10 transition-colors cursor-pointer"
        >
          ● TV — {CHANNELS[activeIdx].name}
        </button>
      </div>
    );
  }

  // Floating mode — draggable + resizable
  return (
    <Rnd
      default={{ x: window.innerWidth - 520, y: 80, width: 480, height: 320 }}
      minWidth={320}
      minHeight={220}
      bounds="window"
      style={{ zIndex: 2000 }}
      dragHandleClassName="tv-drag-handle"
    >
      <div className="w-full h-full flex flex-col tv-drag-handle cursor-move">
        <TVContent
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          isFloating={true}
          onToggleFloat={toggleFloat}
          onMinimize={() => setMinimized(true)}
        />
      </div>
    </Rnd>
  );
}
