import PanelCard from './PanelCard';
import DealEnvironmentPanel from './DealEnvironmentPanel';

function Placeholder({ label }) {
  return (
    <p className="text-txt-secondary text-xs text-center py-6">{label} — coming soon</p>
  );
}

export default function BelowFold({ quotes, quotesLoading, quotesLastUpdated }) {
  return (
    <div className="px-4 pb-4 flex flex-col gap-4">
      <DealEnvironmentPanel quotes={quotes} loading={quotesLoading} lastUpdated={quotesLastUpdated} />

      {/* Charts row — Step 12 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PanelCard title="VIX" className="min-h-[200px]">
          <Placeholder label="VIX time-series chart" />
        </PanelCard>
        <PanelCard title="HY OAS" className="min-h-[200px]">
          <Placeholder label="ICE BofA HY OAS chart" />
        </PanelCard>
        <PanelCard title="10Y-2Y Spread" className="min-h-[200px]">
          <Placeholder label="Treasury curve spread chart" />
        </PanelCard>
      </div>
    </div>
  );
}
