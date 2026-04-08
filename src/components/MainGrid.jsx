import PanelCard from './PanelCard';
import LiveTVPanel from './LiveTVPanel';
import FinancingConditionsPanel from './FinancingConditionsPanel';

function Placeholder({ label }) {
  return (
    <p className="text-txt-secondary text-xs text-center py-6">{label} — coming soon</p>
  );
}

export default function MainGrid({ quotes, quotesLoading, fredData, fredLoading, fredLastUpdated }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
      {/* Left Column */}
      <div className="flex flex-col gap-4 order-3 md:order-1 xl:order-1">
        <FinancingConditionsPanel
          fredData={fredData}
          fredLoading={fredLoading}
          fredLastUpdated={fredLastUpdated}
          quotes={quotes}
          quotesLoading={quotesLoading}
        />
        <PanelCard title="IPO Tracker" className="min-h-[280px]">
          <Placeholder label="424B4 priced + S-1 filed" />
        </PanelCard>
      </div>

      {/* Middle Column */}
      <div className="flex flex-col gap-4 order-1 md:order-2 xl:order-2">
        <PanelCard title="Strategic Deal Flow" className="min-h-[320px]">
          <Placeholder label="8-K Item 1.01 + S-4 filings" />
        </PanelCard>
        <PanelCard title="M&A News Feed" className="min-h-[280px]">
          <Placeholder label="RSS headlines — merger, acquisition, buyout" />
        </PanelCard>
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 order-2 md:order-3 xl:order-3">
        <LiveTVPanel />
        <PanelCard title="Sponsor / LBO Monitor" className="min-h-[320px]">
          <Placeholder label="Take-private, LBO, sponsor exit" />
        </PanelCard>
      </div>
    </div>
  );
}
