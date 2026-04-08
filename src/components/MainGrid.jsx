import LiveTVPanel from './LiveTVPanel';
import FinancingConditionsPanel from './FinancingConditionsPanel';
import DealFlowPanel from './DealFlowPanel';
import MANewsFeedPanel from './MANewsFeedPanel';
import IPOTrackerPanel from './IPOTrackerPanel';
import SponsorMonitorPanel from './SponsorMonitorPanel';

export default function MainGrid({ quotes, quotesLoading, fredData, fredLoading, fredLastUpdated }) {
  return (
    <>
      {/* Mobile: stacked with priority ordering. Tablet/Desktop: 2-col / 3-col grid */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
        {/* Left Column */}
        <div className="flex flex-col gap-4">
          <FinancingConditionsPanel
            fredData={fredData}
            fredLoading={fredLoading}
            fredLastUpdated={fredLastUpdated}
            quotes={quotes}
            quotesLoading={quotesLoading}
          />
          <IPOTrackerPanel />
        </div>

        {/* Middle Column */}
        <div className="flex flex-col gap-4">
          <DealFlowPanel />
          <MANewsFeedPanel />
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4">
          <LiveTVPanel />
          <SponsorMonitorPanel />
        </div>
      </div>

      {/* Mobile layout — priority stacked per brief */}
      <div className="flex flex-col gap-3 p-3 md:hidden">
        <MANewsFeedPanel />
        <DealFlowPanel />
        <FinancingConditionsPanel
          fredData={fredData}
          fredLoading={fredLoading}
          fredLastUpdated={fredLastUpdated}
          quotes={quotes}
          quotesLoading={quotesLoading}
        />
        <IPOTrackerPanel />
        <SponsorMonitorPanel />
        <LiveTVPanel />
      </div>
    </>
  );
}
