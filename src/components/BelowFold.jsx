import { useMemo } from 'react';
import DealEnvironmentPanel from './DealEnvironmentPanel';
import TimeSeriesPanel from './TimeSeriesPanel';
import useYFHistory from '../hooks/useYFHistory';

export default function BelowFold({ quotes, quotesLoading, quotesLastUpdated, fredData, fredLoading, fredLastUpdated }) {
  const { data: vixHistory, loading: vixLoading, lastUpdated: vixUpdated } = useYFHistory('^VIX', 3600000);

  // HY OAS from FRED observations (already fetched, last 60 observations)
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
    <div className="px-4 pb-4 flex flex-col gap-4">
      <DealEnvironmentPanel quotes={quotes} loading={quotesLoading} lastUpdated={quotesLastUpdated} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TimeSeriesPanel
          title="VIX"
          data={vixHistory}
          loading={vixLoading}
          lastUpdated={vixUpdated}
          referenceLine={20}
        />
        <TimeSeriesPanel
          title="HY OAS"
          data={hyOasData}
          loading={fredLoading}
          lastUpdated={fredLastUpdated}
        />
        <TimeSeriesPanel
          title="10Y-2Y Spread"
          data={spreadData}
          loading={fredLoading}
          lastUpdated={fredLastUpdated}
          referenceLine={0}
        />
      </div>
    </div>
  );
}
