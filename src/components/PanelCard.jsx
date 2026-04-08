function timeAgo(date) {
  if (!date) return '';
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function PanelCard({ title, lastUpdated, loading, error, children, footer, compact, onRefresh, className = '' }) {
  return (
    <div className={`bg-navy-panel rounded-lg border border-gold/15 flex flex-col overflow-hidden ${className}`}>
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gold/10">
        <h2 className="text-[11px] font-bold tracking-[1.5px] text-gold uppercase">
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {loading && (
            <span className="text-[9px] text-gold/60 animate-pulse">UPDATING</span>
          )}
          {lastUpdated && (
            <span className="text-[9px] text-txt-secondary">
              {timeAgo(lastUpdated)}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={(e) => { e.preventDefault(); onRefresh(); }}
              className="text-[10px] text-txt-secondary hover:text-gold transition-colors cursor-pointer leading-none"
              title="Refresh"
            >
              ↻
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className={`flex-1 overflow-y-auto min-h-0 ${compact ? 'px-3 py-1.5' : 'px-4 py-3'}`}>
        {error ? (
          <div className="text-neg text-xs py-4 text-center">
            {error}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Optional footer — flush to bottom */}
      {footer && (
        <div className="px-3 py-1.5 border-t border-gold/10">
          {footer}
        </div>
      )}
    </div>
  );
}
