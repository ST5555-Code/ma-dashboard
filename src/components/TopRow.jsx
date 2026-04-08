import { useMemo } from 'react';
import { YFTimeSeriesPanel, FREDTimeSeriesPanel } from './TimeSeriesPanel';
import LiveTVPanel from './LiveTVPanel';

export default function TopRow({ fredData, fredLoading, fredLastUpdated }) {
  // HY OAS from FRED observations — full dataset, panel handles filtering
  const hyOasData = useMemo(() => {
    const obs = fredData?.BAMLH0A0HYM2?.observations;
    if (!obs?.length) return [];
    return [...obs].reverse();
  }, [fredData]);

  // 10Y-2Y spread computed from FRED DGS10 and DGS2
  const spreadData = useMemo(() => {
    const dgs10 = fredData?.DGS10?.observations;
    const dgs2 = fredData?.DGS2?.observations;
    if (!dgs10?.length || !dgs2?.length) return [];

    const map2 = {};
    for (const d of dgs2) map2[d.date] = d.value;

    return dgs10
      .filter(d => map2[d.date] != null)
      .map(d => ({
        date: d.date,
        value: Math.round((d.value - map2[d.date]) * 100) / 100,
      }))
      .reverse();
  }, [fredData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pt-4">
      <YFTimeSeriesPanel title="VIX" symbol="^VIX" referenceLine={20} />
      <FREDTimeSeriesPanel
        title="HY OAS"
        data={hyOasData}
        loading={fredLoading}
        lastUpdated={fredLastUpdated}
      />
      <FREDTimeSeriesPanel
        title="10Y-2Y Spread"
        data={spreadData}
        loading={fredLoading}
        lastUpdated={fredLastUpdated}
        referenceLine={0}
      />
      <LiveTVPanel />
    </div>
  );
}
