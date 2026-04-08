import FinancingConditionsPanel from './FinancingConditionsPanel';
import DealFlowPanel from './DealFlowPanel';
import MANewsFeedPanel from './MANewsFeedPanel';
import IPOTrackerPanel from './IPOTrackerPanel';
import SponsorMonitorPanel from './SponsorMonitorPanel';

export default function MainGrid({ quotes, quotesLoading, fredData, fredLoading, fredLastUpdated }) {
  return (
    <>
      {/* Tablet/Desktop: 3-col grid */}
      <div className="hidden md:grid md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
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

        <div className="flex flex-col gap-4">
          <MANewsFeedPanel />
          <DealFlowPanel />
        </div>

        <div className="flex flex-col gap-4">
          <SponsorMonitorPanel />
        </div>
      </div>

      {/* Mobile: priority stacked */}
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
      </div>
    </>
  );
}
