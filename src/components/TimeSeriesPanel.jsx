import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import PanelCard from './PanelCard';

const CHART_COLORS = {
  VIX: '#DCB96E',
  'HY OAS': '#C94040',
  '10Y-2Y Spread': '#4CAF7D',
};

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

export default function TimeSeriesPanel({ title, data, loading, lastUpdated, referenceLine }) {
  const color = CHART_COLORS[title] || '#DCB96E';

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

  return (
    <PanelCard title={title} loading={loading} lastUpdated={lastUpdated}>
      {chartData.length === 0 ? (
        <p className="text-txt-secondary text-[10px] py-6 text-center">No chart data</p>
      ) : (
        <>
          {/* Stats header */}
          {stats && (
            <div className="flex items-baseline justify-between mb-2">
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

          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
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
                width={40}
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

          <div className="text-[8px] text-txt-secondary text-right mt-1">YTD</div>
        </>
      )}
    </PanelCard>
  );
}
