const MARKET_ITEMS = [
  // US
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: '^DJI', label: 'Dow' },
  { sym: '^RUT', label: 'Russell' },
  // EU / UK
  { sym: '^FTSE', label: 'FTSE' },
  { sym: '^GDAXI', label: 'DAX' },
  { sym: '^FCHI', label: 'CAC 40' },
  { sym: '^STOXX50E', label: 'Stoxx 50' },
  // Asia
  { sym: '^N225', label: 'Nikkei' },
  { sym: '^HSI', label: 'Hang Seng' },
  // Commodities + Vol
  { sym: 'CL=F', label: 'WTI' },
  { sym: '^VIX', label: 'VIX' },
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

export default function MarketsBar({ quotes, loading }) {
  return (
    <div className="bg-[#8B1A1A] px-5 py-1.5 flex items-center gap-4 overflow-x-auto">
      <div className="bg-white text-[#8B1A1A] text-[10px] font-bold px-1.5 py-0.5 tracking-wider flex-shrink-0">
        MARKETS
      </div>
      <div className="flex items-center gap-0 overflow-x-auto">
        {MARKET_ITEMS.map((item, i) => {
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
      </div>
    </div>
  );
}
