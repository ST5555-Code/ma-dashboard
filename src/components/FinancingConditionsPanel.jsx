import { useMemo } from 'react';
import PanelCard from './PanelCard';

// Threshold logic: green = accommodative, red = restrictive
// These are directional signals, not absolute targets
function signal(metric, value) {
  if (value == null) return 'neutral';
  switch (metric) {
    case 'SOFR':       return value < 4.5 ? 'green' : value > 5.5 ? 'red' : 'neutral';
    case '10Y':        return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case '2Y':         return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case 'SPREAD':     return value > 0.5 ? 'green' : value < -0.5 ? 'red' : 'neutral';
    case 'VIX':        return value < 18 ? 'green' : value > 25 ? 'red' : 'neutral';
    case 'HYG_CHG':    return value > 0 ? 'green' : value < -1 ? 'red' : 'neutral';
    case 'LQD_CHG':    return value > 0 ? 'green' : value < -0.5 ? 'red' : 'neutral';
    default:           return 'neutral';
  }
}

const signalColor = {
  green: 'text-pos',
  red: 'text-neg',
  neutral: 'text-txt-primary',
};

const dotColor = {
  green: 'bg-pos',
  red: 'bg-neg',
  neutral: 'bg-txt-secondary',
};

function Row({ label, value, unit, signalKey }) {
  const s = signal(signalKey, value);
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-txt-secondary text-[11px]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-semibold tabular-nums ${signalColor[s]}`}>
          {value != null ? `${value.toFixed(2)}${unit || ''}` : '--'}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor[s]}`} />
      </div>
    </div>
  );
}

export default function FinancingConditionsPanel({ fredData, fredLoading, fredLastUpdated, quotes, quotesLoading }) {
  const rows = useMemo(() => {
    const sofr = fredData?.SOFR?.latest?.value;
    const tenY = quotes?.['^TNX']?.price;
    const twoY = quotes?.['^IRX']?.price;
    const spread = (tenY != null && twoY != null) ? tenY - twoY : null;
    const vix = quotes?.['^VIX']?.price;
    const hyg = quotes?.['HYG'];
    const lqd = quotes?.['LQD'];

    return [
      { label: 'SOFR', value: sofr, unit: '%', signalKey: 'SOFR' },
      { label: '10Y UST Yield', value: tenY, unit: '%', signalKey: '10Y' },
      { label: '2Y UST Yield', value: twoY, unit: '%', signalKey: '2Y' },
      { label: '10Y-2Y Spread', value: spread, unit: '%', signalKey: 'SPREAD' },
      { label: 'VIX', value: vix, unit: '', signalKey: 'VIX' },
      { label: 'HYG', value: hyg?.price, unit: '', signalKey: 'HYG_CHG', sub: hyg?.changePct },
      { label: 'LQD', value: lqd?.price, unit: '', signalKey: 'LQD_CHG', sub: lqd?.changePct },
    ];
  }, [fredData, quotes]);

  const loading = fredLoading || quotesLoading;
  const lastUpdated = fredLastUpdated;

  return (
    <PanelCard title="Financing Conditions" loading={loading} lastUpdated={lastUpdated}>
      <div className="flex flex-col">
        {rows.map((r) => (
          <div key={r.label}>
            <Row label={r.label} value={r.value} unit={r.unit} signalKey={r.signalKey} />
            {r.sub != null && (
              <div className="text-right -mt-1 mb-1">
                <span className={`text-[10px] ${r.sub >= 0 ? 'text-pos' : 'text-neg'}`}>
                  {r.sub >= 0 ? '+' : ''}{r.sub.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Composite signal */}
      <CompositeSignal rows={rows} />
    </PanelCard>
  );
}

function CompositeSignal({ rows }) {
  const greenCount = rows.filter(r => signal(r.signalKey, r.sub ?? r.value) === 'green').length;
  const redCount = rows.filter(r => signal(r.signalKey, r.sub ?? r.value) === 'red').length;

  let label, color;
  if (greenCount >= 4) {
    label = 'ACCOMMODATIVE';
    color = 'text-pos border-pos/30 bg-pos/10';
  } else if (redCount >= 4) {
    label = 'RESTRICTIVE';
    color = 'text-neg border-neg/30 bg-neg/10';
  } else {
    label = 'MIXED';
    color = 'text-gold border-gold/30 bg-gold/10';
  }

  return (
    <div className={`mt-3 py-2 px-3 rounded border text-center text-[11px] font-bold tracking-wider ${color}`}>
      {label}
    </div>
  );
}
