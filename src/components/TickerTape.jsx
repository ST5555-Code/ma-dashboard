import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

const TICKER_SYMBOLS = [
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
  { sym: 'CL=F', label: 'WTI Crude' },
  { sym: '^VIX', label: 'VIX' },
  // M&A Arb ETFs
  { sym: 'MNA', label: 'MNA' },
  { sym: 'MRGR', label: 'MRGR' },
];

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChg(v) {
  if (v == null) return '';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

export default function TickerTape({ quotes, loading }) {
  return (
    <div className="bg-navy-panel border-b border-[#2a3560] py-1.5">
      {loading && Object.keys(quotes).length === 0 ? (
        <div className="text-txt-secondary text-[12px] px-5">Loading market data...</div>
      ) : (
        <Marquee speed={40} pauseOnHover gradient={false}>
          {TICKER_SYMBOLS.map((item) => {
            const q = quotes[item.sym];
            return (
              <div
                key={item.sym}
                className="inline-flex items-center gap-1.5 px-4 border-r border-[#3a4570] text-[12px]"
              >
                <span className="text-white font-semibold">{item.label}</span>
                {q ? (
                  <>
                    <span className="text-white">{fmt(q.price)}</span>
                    <span className={colorClass(q.changePct)}>{fmtChg(q.changePct)}</span>
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
  );
}
