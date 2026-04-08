import { useMemo } from 'react';
import { YFTimeSeriesPanel, FREDTimeSeriesPanel } from './TimeSeriesPanel';
import YieldCurvePanel from './YieldCurvePanel';
import LiveTVPanel from './LiveTVPanel';

export default function TopRow({ fredData, fredLoading, fredLastUpdated, refreshFRED }) {
  const hyOasData = useMemo(() => {
    const obs = fredData?.BAMLH0A0HYM2?.observations;
    if (!obs?.length) return [];
    return [...obs].reverse();
  }, [fredData]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pt-4">
      <YFTimeSeriesPanel title="Volatility (VIX)" symbol="^VIX" referenceLine={20} />
      <FREDTimeSeriesPanel
        title="HY Spread (HY OAS)"
        data={hyOasData}
        loading={fredLoading}
        lastUpdated={fredLastUpdated}
        bps
        onRefresh={refreshFRED}
      />
      <YieldCurvePanel fredData={fredData} loading={fredLoading} lastUpdated={fredLastUpdated} onRefresh={refreshFRED} />
      <LiveTVPanel />
    </div>
  );
}
