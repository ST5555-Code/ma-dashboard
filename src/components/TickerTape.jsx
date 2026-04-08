import Marquee from 'react-fast-marquee';

// Fixed watchlist from brief + most active will be added later
const TICKER_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: '^RUT', label: 'Russell 2000' },
  { sym: '^VIX', label: 'VIX' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: 'HYG', label: 'HYG' },
  { sym: 'LQD', label: 'LQD' },
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
  const items = TICKER_SYMBOLS.map((t) => {
    const q = quotes[t.sym];
    return { ...t, quote: q };
  });

  return (
    <div className="bg-navy-panel border-b border-[#2a3560] py-1.5">
      {loading && Object.keys(quotes).length === 0 ? (
        <div className="text-txt-secondary text-[12px] px-5">Loading market data...</div>
      ) : (
        <Marquee speed={40} pauseOnHover gradient={false}>
          {items.map((item) => (
            <div
              key={item.sym}
              className="inline-flex items-center gap-1.5 px-4 border-r border-[#3a4570] text-[12px]"
            >
              <span className="text-white font-semibold">{item.label}</span>
              {item.quote ? (
                <>
                  <span className="text-white">{fmt(item.quote.price)}</span>
                  <span className={colorClass(item.quote.changePct)}>
                    {fmtChg(item.quote.changePct)}
                  </span>
                </>
              ) : (
                <span className="text-white/40">--</span>
              )}
            </div>
          ))}
        </Marquee>
      )}
    </div>
  );
}

export { TICKER_SYMBOLS };
