import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const CHANNELS = [
  { name: 'Bloomberg', videoId: 'iEpJwprxDdk', ytUrl: 'https://www.youtube.com/@BloombergTelevision/live' },
  { name: 'CNBC', videoId: '9NyxcX3rhQs', ytUrl: 'https://www.youtube.com/@CNBC/live' },
  { name: 'Fox Business', videoId: 'UiV-HNPpHWg', ytUrl: 'https://www.youtube.com/@FoxBusiness/live' },
];

function ChannelBar({ activeIdx, setActiveIdx }) {
  return (
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
  );
}

function Player({ videoId, name, fill }) {
  return (
    <div className={`relative w-full bg-black ${fill ? 'flex-1' : ''}`} style={fill ? {} : { paddingTop: '56.25%' }}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className={fill ? 'w-full h-full border-0' : 'absolute top-0 left-0 w-full h-full border-0'}
        title={name}
      />
    </div>
  );
}

function FloatingTV({ activeIdx, setActiveIdx, onDock, onMinimize }) {
  const [pos, setPos] = useState(() => ({ x: window.innerWidth - 520, y: 80 }));
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const ch = CHANNELS[activeIdx];

  function handleMouseDown(e) {
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'IFRAME') return;
    setDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, ox: pos.x, oy: pos.y });
  }

  function handleMouseMove(e) {
    if (!dragging || !dragStart) return;
    setPos({
      x: dragStart.ox + (e.clientX - dragStart.mx),
      y: dragStart.oy + (e.clientY - dragStart.my),
    });
  }

  function handleMouseUp() {
    setDragging(false);
    setDragStart(null);
  }

  return createPortal(
    <div
      className="fixed"
      style={{ left: pos.x, top: pos.y, width: 480, zIndex: 2000 }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-navy-panel rounded-lg border border-gold/30 shadow-2xl flex flex-col overflow-hidden">
        {/* Drag handle title bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b border-gold/10 cursor-move select-none"
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-[11px] font-bold tracking-[1.5px] text-gold uppercase">Live TV</h2>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-neg font-semibold animate-pulse">● LIVE</span>
            <span className="text-[9px] text-txt-secondary">{ch.name}</span>
            <button
              onClick={onMinimize}
              className="text-[8px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
            >
              MIN
            </button>
            <button
              onClick={onDock}
              className="text-[8px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
            >
              DOCK
            </button>
          </div>
        </div>
        <Player videoId={ch.videoId} name={ch.name} fill={false} />
        <ChannelBar activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
      </div>
    </div>,
    document.body
  );
}

export default function LiveTVPanel() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [floating, setFloating] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const ch = CHANNELS[activeIdx];

  const toggleFloat = useCallback(() => {
    setFloating(true);
    setMinimized(false);
  }, []);

  const dock = useCallback(() => {
    setFloating(false);
    setMinimized(false);
  }, []);

  // Minimized pill
  if (floating && minimized) {
    return (
      <>
        {/* Placeholder in grid */}
        <div className="bg-navy-panel rounded-lg border border-gold/15 p-4 text-center">
          <p className="text-txt-secondary text-[10px]">TV floating — minimized</p>
          <button onClick={() => setMinimized(false)} className="text-gold text-[10px] mt-1 cursor-pointer hover:underline">Restore</button>
          <span className="mx-2 text-txt-secondary text-[10px]">|</span>
          <button onClick={dock} className="text-gold text-[10px] mt-1 cursor-pointer hover:underline">Dock</button>
        </div>
        <div className="fixed bottom-4 right-4 z-[2000]">
          <button
            onClick={() => setMinimized(false)}
            className="bg-navy-panel border border-gold/30 text-gold text-[10px] px-3 py-2 rounded shadow-lg hover:bg-gold/10 transition-colors cursor-pointer"
          >
            ● TV — {ch.name}
          </button>
        </div>
      </>
    );
  }

  // Floating overlay + placeholder in grid
  if (floating) {
    return (
      <>
        <div className="bg-navy-panel rounded-lg border border-gold/15 p-4 text-center">
          <p className="text-txt-secondary text-[10px]">TV floating</p>
          <button onClick={dock} className="text-gold text-[10px] mt-1 cursor-pointer hover:underline">Dock</button>
        </div>
        <FloatingTV
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          onDock={dock}
          onMinimize={() => setMinimized(true)}
        />
      </>
    );
  }

  // Docked mode
  return (
    <div className="bg-navy-panel rounded-lg border border-gold/15 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
        <h2 className="text-[11px] font-bold tracking-[1.5px] text-gold uppercase">Live TV</h2>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-neg font-semibold animate-pulse">● LIVE</span>
          <span className="text-[9px] text-txt-secondary">{ch.name}</span>
          <button
            onClick={toggleFloat}
            className="hidden xl:inline-block text-[8px] text-gold/60 border border-gold/20 px-1.5 py-0.5 rounded hover:text-gold hover:border-gold/40 transition-colors cursor-pointer"
          >
            FLOAT
          </button>
        </div>
      </div>
      <Player videoId={ch.videoId} name={ch.name} fill={false} />
      <ChannelBar activeIdx={activeIdx} setActiveIdx={setActiveIdx} />
    </div>
  );
}
