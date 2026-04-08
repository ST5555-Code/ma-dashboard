import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

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
  const hasData = !loading || Object.keys(quotes).length > 0;

  return (
    <div className="bg-navy border-b border-gold/30 flex items-center">
      {/* Fixed label */}
      <div className="bg-gold text-navy text-[10px] font-bold py-2 tracking-wider flex-shrink-0 z-10 w-[70px] text-center">
        MARKETS
      </div>
      {/* Scrolling tape */}
      <div className="flex-1 overflow-hidden py-1.5">
        {!hasData ? (
          <div className="text-txt-secondary text-[12px] px-5">Loading markets...</div>
        ) : (
          <Marquee speed={25} pauseOnHover gradient={false}>
            {MARKET_ITEMS.map((item) => {
              const q = quotes[item.sym];
              return (
                <div
                  key={item.sym}
                  className="inline-flex items-baseline gap-1.5 px-4 border-r border-white/15 whitespace-nowrap text-[12px]"
                >
                  <span className="text-white/65 text-[10px] font-semibold tracking-wide uppercase">
                    {item.label}
                  </span>
                  {q ? (
                    <>
                      <span className="text-white font-semibold">{fmt(q.price)}</span>
                      <span className={`text-[11px] ${colorClass(q.changePct)}`}>
                        {fmtChg(q.changePct)}
                      </span>
                    </>
                  ) : (
                    <span className="text-white/40">--</span>
                  )}
                </div>
              );
            })}
          </Marquee>
        )}
      </div>
    </div>
  );
}
