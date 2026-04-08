import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

const YF_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: '^RUT', label: 'Russell 2000' },
  { sym: '^VIX', label: 'VIX' },
  { sym: '^TNX', label: '10Y UST' },
  { sym: 'MNA', label: 'MNA' },
  { sym: 'MRGR', label: 'MRGR' },
];

const FRED_SPREADS = [
  { series: 'BAMLH0A0HYM2', label: 'HY Spread' },
  { series: 'BAMLC0A0CM', label: 'IG Spread' },
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

export default function TickerTape({ quotes, loading, fredData }) {
  return (
    <div className="bg-navy-panel border-b border-[#2a3560] py-1.5">
      {loading && Object.keys(quotes).length === 0 ? (
        <div className="text-txt-secondary text-[12px] px-5">Loading market data...</div>
      ) : (
        <Marquee speed={40} pauseOnHover gradient={false}>
          {YF_SYMBOLS.map((item) => {
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

          {FRED_SPREADS.map((item) => {
            const spread = getFredSpread(fredData, item.series);
            return (
              <div
                key={item.series}
                className="inline-flex items-center gap-1.5 px-4 border-r border-[#3a4570] text-[12px]"
              >
                <span className="text-white font-semibold">{item.label}</span>
                {spread ? (
                  <>
                    <span className="text-white">{spread.bps} bps</span>
                    {spread.change != null && (
                      <span className={oasColorClass(spread.change)}>
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
        </Marquee>
      )}
    </div>
  );
}
