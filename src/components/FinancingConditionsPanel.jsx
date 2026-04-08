import { useMemo } from 'react';
import PanelCard from './PanelCard';

// Threshold logic: green = accommodative, red = restrictive
function signal(metric, value) {
  if (value == null) return 'neutral';
  switch (metric) {
    case 'SOFR':       return value < 4.5 ? 'green' : value > 5.5 ? 'red' : 'neutral';
    case '10Y':        return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case '2Y':         return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case 'SPREAD':     return value > 0.5 ? 'green' : value < -0.5 ? 'red' : 'neutral';
    case 'VIX':        return value < 18 ? 'green' : value > 25 ? 'red' : 'neutral';
    case 'HY_OAS':     return value < 350 ? 'green' : value > 500 ? 'red' : 'neutral';
    case 'IG_OAS':     return value < 100 ? 'green' : value > 150 ? 'red' : 'neutral';
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

function getFredSpread(fredData, seriesId) {
  const obs = fredData?.[seriesId]?.observations;
  if (!obs?.length) return { bps: null, change: null };
  const latest = obs[0];
  const prev = obs.length >= 2 ? obs[1] : null;
  const bps = Math.round(latest.value * 100);
  const prevBps = prev ? Math.round(prev.value * 100) : null;
  const change = prevBps != null ? bps - prevBps : null;
  return { bps, change };
}

function Row({ label, value, unit, signalKey }) {
  const s = signal(signalKey, value);
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-txt-secondary text-[11px]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-semibold tabular-nums ${signalColor[s]}`}>
          {value != null ? `${typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(2)}${unit || ''}` : '--'}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor[s]}`} />
      </div>
    </div>
  );
}

function SpreadRow({ label, bps, change, signalKey }) {
  const s = signal(signalKey, bps);
  // For OAS: wider (positive change) = bad, tighter (negative) = good
  const chgColor = change == null || change === 0 ? 'text-txt-secondary' : change < 0 ? 'text-pos' : 'text-neg';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-txt-secondary text-[11px]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-semibold tabular-nums ${signalColor[s]}`}>
          {bps != null ? `${bps} bps` : '--'}
        </span>
        {change != null && (
          <span className={`text-[10px] tabular-nums ${chgColor}`}>
            {change >= 0 ? '+' : ''}{change}
          </span>
        )}
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor[s]}`} />
      </div>
    </div>
  );
}

export default function FinancingConditionsPanel({ fredData, fredLoading, fredLastUpdated, quotes, quotesLoading }) {
  const hySpread = useMemo(() => getFredSpread(fredData, 'BAMLH0A0HYM2'), [fredData]);
  const igSpread = useMemo(() => getFredSpread(fredData, 'BAMLC0A0CM'), [fredData]);

  const rows = useMemo(() => {
    const sofr = fredData?.SOFR?.latest?.value;
    const tenY = quotes?.['^TNX']?.price;
    const twoY = quotes?.['^IRX']?.price;
    const spread = (tenY != null && twoY != null) ? tenY - twoY : null;
    const vix = quotes?.['^VIX']?.price;

    return [
      { label: 'SOFR', value: sofr, unit: '%', signalKey: 'SOFR' },
      { label: '10Y UST Yield', value: tenY, unit: '%', signalKey: '10Y' },
      { label: '2Y UST Yield', value: twoY, unit: '%', signalKey: '2Y' },
      { label: '10Y-2Y Spread', value: spread, unit: '%', signalKey: 'SPREAD' },
      { label: 'VIX', value: vix, unit: '', signalKey: 'VIX' },
    ];
  }, [fredData, quotes]);

  const allSignalValues = [
    ...rows.map(r => ({ key: r.signalKey, value: r.value })),
    { key: 'HY_OAS', value: hySpread.bps },
    { key: 'IG_OAS', value: igSpread.bps },
  ];

  const loading = fredLoading || quotesLoading;

  return (
    <PanelCard title="Financing Conditions" loading={loading} lastUpdated={fredLastUpdated}>
      <div className="flex flex-col">
        {rows.map((r) => (
          <Row key={r.label} label={r.label} value={r.value} unit={r.unit} signalKey={r.signalKey} />
        ))}
        <SpreadRow label="HY Spread (HY OAS)" bps={hySpread.bps} change={hySpread.change} signalKey="HY_OAS" />
        <SpreadRow label="IG Spread (IG OAS)" bps={igSpread.bps} change={igSpread.change} signalKey="IG_OAS" />
      </div>

      <CompositeSignal values={allSignalValues} />
    </PanelCard>
  );
}

function CompositeSignal({ values }) {
  const greenCount = values.filter(v => signal(v.key, v.value) === 'green').length;
  const redCount = values.filter(v => signal(v.key, v.value) === 'red').length;

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
