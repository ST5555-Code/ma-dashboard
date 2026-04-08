import LiveTVPanel from './LiveTVPanel';
import FinancingConditionsPanel from './FinancingConditionsPanel';
import DealFlowPanel from './DealFlowPanel';
import MANewsFeedPanel from './MANewsFeedPanel';
import IPOTrackerPanel from './IPOTrackerPanel';
import SponsorMonitorPanel from './SponsorMonitorPanel';

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
        <IPOTrackerPanel />
      </div>

      {/* Middle Column */}
      <div className="flex flex-col gap-4 order-1 md:order-2 xl:order-2">
        <DealFlowPanel />
        <MANewsFeedPanel />
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-4 order-2 md:order-3 xl:order-3">
        <LiveTVPanel />
        <SponsorMonitorPanel />
      </div>
    </div>
  );
}
