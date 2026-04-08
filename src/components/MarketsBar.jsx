const YF_ITEMS = [
  { sym: '^VIX', label: 'VIX' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: '^IRX', label: '2Y UST' },
  { sym: '^GSPC', label: 'S&P 500' },
];

const FRED_ITEMS = [
  { series: 'BAMLH0A0HYM2', label: 'HY Spread' },
  { series: 'BAMLC0A0CM', label: 'IG Spread' },
];

function fmt(v, dec = 2) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function fmtChg(v) {
  if (v == null) return '--';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

// For OAS: wider = bad (red), tighter = good (green) — inverted
function oasColorClass(change) {
  if (change == null || change === 0) return 'text-txt-secondary';
  return change < 0 ? 'text-pos' : 'text-neg';
}

function getFredSpread(fredData, seriesId) {
  const obs = fredData?.[seriesId]?.observations;
  if (!obs?.length) return null;
  const latest = obs[0];
  const prev = obs.length >= 2 ? obs[1] : null;
  const bps = Math.round(latest.value * 100);
  const prevBps = prev ? Math.round(prev.value * 100) : null;
  const change = prevBps != null ? bps - prevBps : null;
  return { bps, change };
}

export default function MarketsBar({ quotes, loading, fredData }) {
  return (
    <div className="bg-[#8B1A1A] px-5 py-1.5 flex items-center gap-4 overflow-x-auto">
      <div className="bg-white text-[#8B1A1A] text-[10px] font-bold px-1.5 py-0.5 tracking-wider flex-shrink-0">
        MARKETS
      </div>
      <div className="flex items-center gap-0 overflow-x-auto">
        {YF_ITEMS.map((item, i) => {
          const q = quotes[item.sym];
          return (
            <div
              key={item.sym}
              className={`inline-flex items-baseline gap-1.5 pr-4 whitespace-nowrap text-[12px] ${
                i > 0 ? 'pl-4 border-l border-white/25' : ''
              }`}
            >
              <span className="text-white/65 text-[10px] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
              {loading && !q ? (
                <span className="text-white/40">--</span>
              ) : q ? (
                <>
                  <span className="text-white font-semibold">{fmt(q.price)}</span>
                  <span className={`text-[11px] ${colorClass(q.changePct)}`}>
                    {fmtChg(q.changePct)}
                  </span>
                </>
              ) : (
                <span className="text-white/40">N/A</span>
              )}
            </div>
          );
        })}

        {/* FRED OAS spreads */}
        {FRED_ITEMS.map((item) => {
          const spread = getFredSpread(fredData, item.series);
          return (
            <div
              key={item.series}
              className="inline-flex items-baseline gap-1.5 pr-4 pl-4 border-l border-white/25 whitespace-nowrap text-[12px]"
            >
              <span className="text-white/65 text-[10px] font-semibold tracking-wide uppercase">
                {item.label}
              </span>
              {spread ? (
                <>
                  <span className="text-white font-semibold">{spread.bps} bps</span>
                  {spread.change != null && (
                    <span className={`text-[11px] ${oasColorClass(spread.change)}`}>
                      {spread.change >= 0 ? '+' : ''}{spread.change}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-white/40">--</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
