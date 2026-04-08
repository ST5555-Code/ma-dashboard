import PanelCard from './PanelCard';

function Placeholder({ label }) {
  return (
    <p className="text-txt-secondary text-xs text-center py-6">{label} — coming soon</p>
  );
}

export default function BelowFold() {
  return (
    <div className="px-4 pb-4 flex flex-col gap-4">
      {/* Deal Environment — full width */}
      <PanelCard title="Deal Environment" className="min-h-[160px]">
        <Placeholder label="MNA / MRGR + TIGHT / NORMAL / WIDE signal" />
      </PanelCard>

      {/* Charts row */}
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
