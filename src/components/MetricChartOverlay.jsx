import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import useYFHistory from '../hooks/useYFHistory';
import useFRED from '../hooks/useFRED';

const RANGES = [
  { label: '1W', range: '5d', interval: '1d', days: 7 },
  { label: '1M', range: '1mo', interval: '1d', days: 30 },
  { label: '3M', range: '3mo', interval: '1d', days: 90 },
  { label: 'YTD', range: 'ytd', interval: '1d', days: null },
  { label: '1Y', range: '1y', interval: '1wk', days: 365 },
];

// Define which data source each metric uses
const METRIC_CONFIG = {
  VIX:        { type: 'yf', symbol: '^VIX', color: '#DCB96E', unit: '' },
  '10Y':      { type: 'yf', symbol: '^TNX', color: '#DCB96E', unit: '%' },
  '2Y':       { type: 'yf', symbol: '^IRX', color: '#DCB96E', unit: '%' },
  SOFR:       { type: 'fred', series: 'SOFR', color: '#DCB96E', unit: '%' },
  SPREAD:     { type: 'fred-computed', series10: 'DGS10', series2: 'DGS2', color: '#4CAF7D', unit: '%' },
  HY_OAS:     { type: 'fred', series: 'BAMLH0A0HYM2', color: '#C94040', unit: ' bps', bps: true },
  IG_OAS:     { type: 'fred', series: 'BAMLC0A0CM', color: '#4CAF7D', unit: ' bps', bps: true },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-navy border border-gold/30 rounded px-2 py-1 text-[10px]">
      <div className="text-txt-secondary">{label}</div>
      <div className="text-txt-primary font-semibold">{payload[0].value?.toFixed(2)}{unit}</div>
    </div>
  );
}

function YFChart({ symbol, rangeIdx, color, unit }) {
  const r = RANGES[rangeIdx];
  const { data } = useYFHistory(symbol, r.range, r.interval, 0);
  return <ChartBody data={data} color={color} unit={unit} />;
}

function FREDChart({ series, rangeIdx, color, unit, bps }) {
  const seriesIds = useMemo(() => [series], [series]);
  const { data: fredData } = useFRED(seriesIds, 0);

  const chartData = useMemo(() => {
    const obs = fredData?.[series]?.observations;
    if (!obs?.length) return [];
    let data = [...obs].reverse();
    data = filterByRange(data, rangeIdx);
    if (bps) data = data.map(d => ({ ...d, value: Math.round(d.value * 100) }));
    return data;
  }, [fredData, series, rangeIdx, bps]);

  return <ChartBody data={chartData} color={color} unit={unit} />;
}

function FREDSpreadChart({ rangeIdx, color, unit }) {
  const seriesIds = useMemo(() => ['DGS10', 'DGS2'], []);
  const { data: fredData } = useFRED(seriesIds, 0);

  const chartData = useMemo(() => {
    const dgs10 = fredData?.DGS10?.observations;
    const dgs2 = fredData?.DGS2?.observations;
    if (!dgs10?.length || !dgs2?.length) return [];
    const map2 = {};
    for (const d of dgs2) map2[d.date] = d.value;
    let data = dgs10
      .filter(d => map2[d.date] != null)
      .map(d => ({ date: d.date, value: Math.round((d.value - map2[d.date]) * 100) / 100 }))
      .reverse();
    return filterByRange(data, rangeIdx);
  }, [fredData, rangeIdx]);

  return <ChartBody data={chartData} color={color} unit={unit} />;
}

function filterByRange(data, rangeIdx) {
  const r = RANGES[rangeIdx];
  if (r.days === null) {
    const year = new Date().getFullYear();
    return data.filter(d => d.date >= `${year}-01-01`);
  }
  const cutoff = new Date(Date.now() - r.days * 86400000).toISOString().slice(0, 10);
  return data.filter(d => d.date >= cutoff);
}

function ChartBody({ data, color, unit }) {
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    return data.map(d => ({ date: formatDate(d.date), value: d.value }));
  }, [data]);

  const domain = useMemo(() => {
    if (!chartData.length) return ['auto', 'auto'];
    const vals = chartData.map(d => d.value).filter(v => v != null);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.1 || 0.5;
    return [Math.floor((min - pad) * 100) / 100, Math.ceil((max + pad) * 100) / 100];
  }, [chartData]);

  if (!chartData.length) return <p className="text-txt-secondary text-[10px] py-8 text-center">Loading...</p>;

  const latest = chartData[chartData.length - 1]?.value;
  const first = chartData[0]?.value;
  const change = latest != null && first != null ? latest - first : null;

  return (
    <>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-[16px] font-bold tabular-nums" style={{ color }}>
          {unit === ' bps' ? Math.round(latest) : latest?.toFixed(2)}{unit}
        </span>
        {change != null && (
          <span className={`text-[11px] font-semibold tabular-nums ${change >= 0 ? 'text-pos' : 'text-neg'}`}>
            {change >= 0 ? '+' : ''}{unit === ' bps' ? Math.round(change) : change.toFixed(2)} period
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 2, left: -12 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={{ stroke: '#2a3560' }} interval="preserveStartEnd" />
          <YAxis domain={domain} tick={{ fontSize: 9, fill: '#A0AEC0' }} tickLine={false} axisLine={false} width={38} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: color }} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

export default function MetricChartOverlay({ metricKey, title, onClose }) {
  const [rangeIdx, setRangeIdx] = useState(3);
  const config = METRIC_CONFIG[metricKey];
  if (!config) return null;

  return createPortal(
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-navy-panel border border-gold/30 rounded-lg shadow-2xl w-[480px] max-w-[90vw] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gold/10">
          <h3 className="text-[12px] font-bold tracking-wider text-gold uppercase">{title}</h3>
          <button onClick={onClose} className="text-txt-secondary hover:text-white text-[14px] cursor-pointer leading-none">✕</button>
        </div>

        {/* Chart */}
        <div className="px-4 py-3">
          {config.type === 'yf' && (
            <YFChart symbol={config.symbol} rangeIdx={rangeIdx} color={config.color} unit={config.unit} />
          )}
          {config.type === 'fred' && (
            <FREDChart series={config.series} rangeIdx={rangeIdx} color={config.color} unit={config.unit} bps={config.bps} />
          )}
          {config.type === 'fred-computed' && (
            <FREDSpreadChart rangeIdx={rangeIdx} color={config.color} unit={config.unit} />
          )}
        </div>

        {/* Range selector */}
        <div className="flex gap-1 px-4 pb-3">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => setRangeIdx(i)}
              className={`flex-1 text-[9px] font-semibold py-1 rounded-sm cursor-pointer transition-all ${
                i === rangeIdx ? 'bg-gold/20 text-gold' : 'text-txt-secondary hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
