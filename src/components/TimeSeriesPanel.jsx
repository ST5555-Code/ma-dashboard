import { useMemo, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import PanelCard from './PanelCard';
import useYFHistory from '../hooks/useYFHistory';
import LWChart from './LWChart';

const CHART_COLORS = {
  'Volatility (VIX)': '#DCB96E',
  'HY Spread (HY OAS)': '#C94040',
};

const RANGES = [
  { label: '1W', range: '5d', interval: '1d' },
  { label: '1M', range: '1mo', interval: '1d' },
  { label: '3M', range: '3mo', interval: '1d' },
  { label: 'YTD', range: 'ytd', interval: '1d' },
  { label: '1Y', range: '1y', interval: '1wk' },
];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy border border-gold/30 rounded px-2 py-1 text-[10px]">
      <div className="text-txt-secondary">{label}</div>
      <div className="text-txt-primary font-semibold">{payload[0].value?.toFixed(2)}</div>
    </div>
  );
}

// For YF-sourced charts (VIX) — uses Lightweight Charts
export function YFTimeSeriesPanel({ title, symbol, referenceLine }) {
  const [rangeIdx, setRangeIdx] = useState(3); // default YTD
  const r = RANGES[rangeIdx];
  const { data, loading, lastUpdated, refresh } = useYFHistory(symbol, r.range, r.interval, 1800000);
  const color = CHART_COLORS[title] || '#DCB96E';

  const stats = useMemo(() => {
    if (!data?.length) return null;
    const values = data.map(d => d.value).filter(v => v != null);
    const current = values[values.length - 1];
    const previous = values.length >= 2 ? values[values.length - 2] : null;
    const high = Math.max(...values);
    const low = Math.min(...values);
    const change = previous != null ? current - previous : null;
    const changePct = previous != null && previous !== 0 ? (change / previous) * 100 : null;
    return { current, high, low, change, changePct };
  }, [data]);

  const rangeSelector = (
    <div className="flex gap-1">
      {RANGES.map((rng, i) => (
        <button
          key={rng.label}
          onClick={() => setRangeIdx(i)}
          className={`flex-1 text-[8px] font-semibold py-0.5 rounded-sm cursor-pointer transition-all ${
            i === rangeIdx ? 'bg-gold/20 text-gold' : 'text-txt-secondary hover:text-white'
          }`}
        >
          {rng.label}
        </button>
      ))}
    </div>
  );

  return (
    <PanelCard title={title} loading={loading} lastUpdated={lastUpdated} compact footer={rangeSelector} onRefresh={refresh}>
      {!data?.length ? (
        <p className="text-txt-secondary text-[10px] py-6 text-center">No chart data</p>
      ) : (
        <>
          {stats && (
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] font-bold tabular-nums" style={{ color }}>
                  {stats.current.toFixed(2)}
                </span>
                {stats.change != null && (
                  <span className={`text-[11px] font-semibold tabular-nums ${stats.change >= 0 ? 'text-pos' : 'text-neg'}`}>
                    {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}
                    {stats.changePct != null && ` (${stats.changePct >= 0 ? '+' : ''}${stats.changePct.toFixed(1)}%)`}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-[9px] text-txt-secondary">
                <span>H <span className="text-txt-primary font-medium">{stats.high.toFixed(2)}</span></span>
                <span>L <span className="text-txt-primary font-medium">{stats.low.toFixed(2)}</span></span>
              </div>
            </div>
          )}
          <LWChart data={data} color={color} referenceLine={referenceLine} />
        </>
      )}
    </PanelCard>
  );
}

// For FRED-sourced charts
// bps=true converts percentage values (e.g., 3.05) to basis points (305)
export function FREDTimeSeriesPanel({ title, data, loading, lastUpdated, referenceLine, bps = false, onRefresh }) {
  const [rangeIdx, setRangeIdx] = useState(3); // default YTD
  const color = CHART_COLORS[title] || '#DCB96E';

  // Filter FRED data based on selected range, optionally convert to bps
  const filteredData = useMemo(() => {
    if (!data?.length) return [];
    const now = new Date();
    const cutoffs = {
      0: 7,    // 1W
      1: 30,   // 1M
      2: 90,   // 3M
      3: null,  // YTD — filter by year
      4: 365,  // 1Y
    };
    const days = cutoffs[rangeIdx];
    let filtered;
    if (days === null) {
      const year = now.getFullYear();
      filtered = data.filter(d => d.date >= `${year}-01-01`);
    } else {
      const cutoff = new Date(now.getTime() - days * 86400000).toISOString().slice(0, 10);
      filtered = data.filter(d => d.date >= cutoff);
    }
    if (bps) {
      return filtered.map(d => ({ ...d, value: Math.round(d.value * 100) }));
    }
    return filtered;
  }, [data, rangeIdx, bps]);

  return (
    <ChartPanel
      title={title}
      data={filteredData}
      loading={loading}
      lastUpdated={lastUpdated}
      color={color}
      referenceLine={bps && referenceLine != null ? referenceLine * 100 : referenceLine}
      unit={bps ? ' bps' : ''}
      rangeIdx={rangeIdx}
      setRangeIdx={setRangeIdx}
      onRefresh={onRefresh}
    />
  );
}

function ChartPanel({ title, data, loading, lastUpdated, color, referenceLine, rangeIdx, setRangeIdx, unit = '', onRefresh }) {
  const isInteger = unit === ' bps';
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map(d => ({
      date: formatDate(d.date),
      value: d.value,
    }));
  }, [data]);

  const stats = useMemo(() => {
    if (!data?.length) return null;
    const values = data.map(d => d.value).filter(v => v != null);
    const current = values[values.length - 1];
    const previous = values.length >= 2 ? values[values.length - 2] : null;
    const high = Math.max(...values);
    const low = Math.min(...values);
    const change = previous != null ? current - previous : null;
    const changePct = previous != null && previous !== 0 ? (change / previous) * 100 : null;
    return { current, high, low, change, changePct };
  }, [data]);

  const domain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const values = chartData.map(d => d.value).filter(v => v != null);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.1 || 0.5;
    return [Math.floor((min - pad) * 100) / 100, Math.ceil((max + pad) * 100) / 100];
  }, [chartData]);

  const rangeSelector = (
    <div className="flex gap-1">
      {RANGES.map((r, i) => (
        <button
          key={r.label}
          onClick={() => setRangeIdx(i)}
          className={`flex-1 text-[8px] font-semibold py-0.5 rounded-sm cursor-pointer transition-all ${
            i === rangeIdx
              ? 'bg-gold/20 text-gold'
              : 'text-txt-secondary hover:text-white'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  return (
    <PanelCard title={title} loading={loading} lastUpdated={lastUpdated} compact footer={rangeSelector} onRefresh={onRefresh}>
      {chartData.length === 0 ? (
        <p className="text-txt-secondary text-[10px] py-6 text-center">No chart data</p>
      ) : (
        <>
          {stats && (
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-2">
                <span className="text-[18px] font-bold tabular-nums" style={{ color }}>
                  {isInteger ? stats.current : stats.current.toFixed(2)}{unit}
                </span>
                {stats.change != null && (
                  <span className={`text-[11px] font-semibold tabular-nums ${isInteger ? (stats.change <= 0 ? 'text-pos' : 'text-neg') : (stats.change >= 0 ? 'text-pos' : 'text-neg')}`}>
                    {stats.change >= 0 ? '+' : ''}{isInteger ? stats.change : stats.change.toFixed(2)}
                    {!isInteger && stats.changePct != null && ` (${stats.changePct >= 0 ? '+' : ''}${stats.changePct.toFixed(1)}%)`}
                  </span>
                )}
              </div>
              <div className="flex gap-3 text-[9px] text-txt-secondary">
                <span>H <span className="text-txt-primary font-medium">{isInteger ? stats.high : stats.high.toFixed(2)}{unit}</span></span>
                <span>L <span className="text-txt-primary font-medium">{isInteger ? stats.low : stats.low.toFixed(2)}{unit}</span></span>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 2, left: -12 }}>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#A0AEC0' }}
                tickLine={false}
                axisLine={{ stroke: '#2a3560' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={domain}
                tick={{ fontSize: 9, fill: '#A0AEC0' }}
                tickLine={false}
                axisLine={false}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} />
              {referenceLine != null && (
                <ReferenceLine y={referenceLine} stroke="#A0AEC0" strokeDasharray="3 3" strokeWidth={0.5} />
              )}
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </PanelCard>
  );
}
