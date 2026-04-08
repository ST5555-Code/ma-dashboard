import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts';
import PanelCard from './PanelCard';
import useFRED from '../hooks/useFRED';

const TENORS = [
  { series: 'DGS1', label: '1Y', months: 12 },
  { series: 'DGS2', label: '2Y', months: 24 },
  { series: 'DGS5', label: '5Y', months: 60 },
  { series: 'DGS10', label: '10Y', months: 120 },
  { series: 'DGS30', label: '30Y', months: 360 },
];

const SERIES_IDS = TENORS.map(t => t.series);

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-navy border border-gold/30 rounded px-2 py-1 text-[10px]">
      <div className="text-txt-secondary">{d.label}</div>
      <div className="text-txt-primary font-semibold">{d.yield?.toFixed(2)}%</div>
    </div>
  );
}

function DotLabel({ cx, cy, payload }) {
  if (!payload?.yield) return null;
  return (
    <text x={cx} y={cy - 10} textAnchor="middle" fill="#FFFFFF" fontSize={10} fontWeight={600}>
      {payload.yield.toFixed(2)}
    </text>
  );
}

export default function YieldCurvePanel() {
  const fredSeries = useMemo(() => SERIES_IDS, []);
  const { data: fredData, loading, lastUpdated } = useFRED(fredSeries, 3600000);

  // Build today's curve + yesterday's curve
  const { todayCurve, yesterdayCurve, curveStatus } = useMemo(() => {
    const today = [];
    const yesterday = [];

    for (const tenor of TENORS) {
      const obs = fredData?.[tenor.series]?.observations;
      if (!obs?.length) {
        today.push({ label: tenor.label, months: tenor.months, yield: null });
        yesterday.push({ label: tenor.label, months: tenor.months, yield: null });
        continue;
      }
      today.push({ label: tenor.label, months: tenor.months, yield: obs[0].value });
      yesterday.push({
        label: tenor.label,
        months: tenor.months,
        yield: obs.length >= 2 ? obs[1].value : null,
      });
    }

    // Determine curve status
    const y2 = today.find(t => t.label === '2Y')?.yield;
    const y10 = today.find(t => t.label === '10Y')?.yield;
    let status = { label: '--', color: 'text-txt-secondary' };
    if (y2 != null && y10 != null) {
      const spread = y10 - y2;
      if (spread < -0.1) {
        status = { label: 'INVERTED', color: 'text-neg' };
      } else if (spread < 0.25) {
        status = { label: 'FLAT', color: 'text-gold' };
      } else {
        status = { label: 'STEEP', color: 'text-pos' };
      }
    }

    return { todayCurve: today, yesterdayCurve: yesterday, curveStatus: status };
  }, [fredData]);

  const domain = useMemo(() => {
    const vals = todayCurve.map(d => d.yield).filter(v => v != null);
    if (!vals.length) return ['auto', 'auto'];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const pad = (max - min) * 0.15 || 0.5;
    return [Math.floor((min - pad) * 100) / 100, Math.ceil((max + pad) * 100) / 100];
  }, [todayCurve]);

  const hasData = todayCurve.some(d => d.yield != null);

  return (
    <PanelCard title="Yield Curve" loading={loading} lastUpdated={lastUpdated}>
      {!hasData ? (
        <p className="text-txt-secondary text-[10px] py-6 text-center">No curve data</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className={`text-[13px] font-bold ${curveStatus.color}`}>
                {curveStatus.label}
              </span>
              <span className="text-[9px] text-txt-secondary">
                {todayCurve.find(t => t.label === '2Y')?.yield?.toFixed(2)}% → {todayCurve.find(t => t.label === '10Y')?.yield?.toFixed(2)}%
              </span>
            </div>
            <div className="flex gap-3 text-[9px] text-txt-secondary">
              <span className="flex items-center gap-1">
                <span className="w-3 h-[2px] bg-gold inline-block" /> Today
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-[2px] bg-txt-secondary/40 inline-block" /> Prior
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart margin={{ top: 20, right: 10, bottom: 5, left: -10 }}>
              <XAxis
                dataKey="label"
                type="category"
                allowDuplicatedCategory={false}
                tick={{ fontSize: 10, fill: '#A0AEC0', fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: '#2a3560' }}
              />
              <YAxis
                domain={domain}
                tick={{ fontSize: 9, fill: '#A0AEC0' }}
                tickLine={false}
                axisLine={false}
                width={38}
                tickFormatter={(v) => `${v.toFixed(1)}%`}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Yesterday's curve — dimmed */}
              <Line
                data={yesterdayCurve}
                type="monotone"
                dataKey="yield"
                stroke="#A0AEC0"
                strokeWidth={1}
                strokeOpacity={0.3}
                dot={false}
              />

              {/* Today's curve */}
              <Line
                data={todayCurve}
                type="monotone"
                dataKey="yield"
                stroke="#DCB96E"
                strokeWidth={2}
                dot={{ r: 4, fill: '#DCB96E', stroke: '#1E2846', strokeWidth: 2 }}
                label={<DotLabel />}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </PanelCard>
  );
}
