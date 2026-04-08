import { useMemo, useState } from 'react';
import PanelCard from './PanelCard';
import MetricChartOverlay from './MetricChartOverlay';

function signal(metric, value) {
  if (value == null) return 'neutral';
  switch (metric) {
    case 'SOFR':   return value < 4.5 ? 'green' : value > 5.5 ? 'red' : 'neutral';
    case '10Y':    return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case '2Y':     return value < 4.0 ? 'green' : value > 5.0 ? 'red' : 'neutral';
    case 'SPREAD': return value > 0.5 ? 'green' : value < -0.5 ? 'red' : 'neutral';
    case 'VIX':    return value < 18 ? 'green' : value > 25 ? 'red' : 'neutral';
    case 'HY_OAS': return value < 350 ? 'green' : value > 500 ? 'red' : 'neutral';
    case 'IG_OAS': return value < 100 ? 'green' : value > 150 ? 'red' : 'neutral';
    default:       return 'neutral';
  }
}

const signalColor = { green: 'text-pos', red: 'text-neg', neutral: 'text-txt-primary' };
const dotColor = { green: 'bg-pos', red: 'bg-neg', neutral: 'bg-txt-secondary' };

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

function ChartIcon() {
  return (
    <span className="text-[9px] text-gold/30 group-hover:text-gold/80 transition-colors ml-0.5">↗</span>
  );
}

function ClickableRow({ label, value, unit, signalKey, onClick }) {
  const s = signal(signalKey, value);
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 w-full text-left cursor-pointer hover:bg-white/[0.03] -mx-1 px-1 rounded transition-colors"
    >
      <span className="text-txt-secondary text-[11px] group-hover:text-gold transition-colors">{label}<ChartIcon /></span>
      <div className="flex items-center gap-2">
        <span className={`text-[13px] font-semibold tabular-nums ${signalColor[s]}`}>
          {value != null ? `${typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(2)}${unit || ''}` : '--'}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor[s]}`} />
      </div>
    </button>
  );
}

function ClickableSpreadRow({ label, bps, change, signalKey, onClick }) {
  const s = signal(signalKey, bps);
  const chgColor = change == null || change === 0 ? 'text-txt-secondary' : change < 0 ? 'text-pos' : 'text-neg';
  return (
    <button
      onClick={onClick}
      className="group flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 w-full text-left cursor-pointer hover:bg-white/[0.03] -mx-1 px-1 rounded transition-colors"
    >
      <span className="text-txt-secondary text-[11px] group-hover:text-gold transition-colors">{label}<ChartIcon /></span>
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
    </button>
  );
}

export default function FinancingConditionsPanel({ fredData, fredLoading, fredLastUpdated, quotes, quotesLoading }) {
  const [chartMetric, setChartMetric] = useState(null);

  const hySpread = useMemo(() => getFredSpread(fredData, 'BAMLH0A0HYM2'), [fredData]);
  const igSpread = useMemo(() => getFredSpread(fredData, 'BAMLC0A0CM'), [fredData]);

  const metrics = useMemo(() => {
    const sofr = fredData?.SOFR?.latest?.value;
    const tenY = quotes?.['^TNX']?.price;
    const twoY = quotes?.['^IRX']?.price;
    const spread = (tenY != null && twoY != null) ? tenY - twoY : null;
    const vix = quotes?.['^VIX']?.price;
    return { sofr, tenY, twoY, spread, vix };
  }, [fredData, quotes]);

  const loading = fredLoading || quotesLoading;

  return (
    <PanelCard title="Financing Conditions" loading={loading} lastUpdated={fredLastUpdated}>
      <div className="flex flex-col">
        {/* VIX at top — not clickable, chart already in top row */}
        <div className="flex items-center justify-between py-1.5 border-b border-white/5">
          <span className="text-txt-secondary text-[11px]">VIX</span>
          <div className="flex items-center gap-2">
            <span className={`text-[13px] font-semibold tabular-nums ${signalColor[signal('VIX', metrics.vix)]}`}>
              {metrics.vix != null ? metrics.vix.toFixed(2) : '--'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor[signal('VIX', metrics.vix)]}`} />
          </div>
        </div>

        {/* Rates */}
        <ClickableRow
          label="SOFR"
          value={metrics.sofr}
          unit="%"
          signalKey="SOFR"
          onClick={() => setChartMetric({ key: 'SOFR', title: 'SOFR' })}
        />
        <ClickableRow
          label="10Y UST Yield"
          value={metrics.tenY}
          unit="%"
          signalKey="10Y"
          onClick={() => setChartMetric({ key: '10Y', title: '10Y UST Yield' })}
        />
        <ClickableRow
          label="2Y UST Yield"
          value={metrics.twoY}
          unit="%"
          signalKey="2Y"
          onClick={() => setChartMetric({ key: '2Y', title: '2Y UST Yield' })}
        />
        <ClickableRow
          label="10Y-2Y Spread"
          value={metrics.spread}
          unit="%"
          signalKey="SPREAD"
          onClick={() => setChartMetric({ key: 'SPREAD', title: '10Y-2Y Spread' })}
        />

        {/* Credit spreads */}
        <ClickableSpreadRow
          label="HY Spread (HY OAS)"
          bps={hySpread.bps}
          change={hySpread.change}
          signalKey="HY_OAS"
          onClick={() => setChartMetric({ key: 'HY_OAS', title: 'HY Spread (HY OAS)' })}
        />
        <ClickableSpreadRow
          label="IG Spread (IG OAS)"
          bps={igSpread.bps}
          change={igSpread.change}
          signalKey="IG_OAS"
          onClick={() => setChartMetric({ key: 'IG_OAS', title: 'IG Spread (IG OAS)' })}
        />
      </div>

      {/* Floating chart overlay */}
      {chartMetric && (
        <MetricChartOverlay
          metricKey={chartMetric.key}
          title={chartMetric.title}
          fredData={fredData}
          onClose={() => setChartMetric(null)}
        />
      )}
    </PanelCard>
  );
}
