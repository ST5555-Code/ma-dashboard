import PanelCard from './PanelCard';
import useEDGAR from '../hooks/useEDGAR';

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function FilingRow({ filing }) {
  return (
    <a
      href={filing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-[11px] text-txt-primary truncate font-medium">{filing.company}</span>
        {filing.ticker && (
          <span className="text-[8px] text-gold bg-gold/10 px-1 py-0.5 rounded font-semibold flex-shrink-0">
            {filing.ticker}
          </span>
        )}
      </div>
      <span className="text-[9px] text-txt-secondary flex-shrink-0 ml-2">{timeAgo(filing.filedDate)}</span>
    </a>
  );
}

function SectionLabel({ label, count }) {
  return (
    <div className="flex items-center gap-2 mb-1 mt-2.5 first:mt-0">
      <span className="text-[9px] font-bold tracking-wider text-gold/70 uppercase">{label}</span>
      <span className="text-[9px] text-txt-secondary">({count})</span>
      <div className="flex-1 border-b border-gold/10" />
    </div>
  );
}

export default function IPOTrackerPanel() {
  // 424B4 = final prospectus (priced/trading)
  const { filings: pricedFilings, loading: pricedLoading, lastUpdated: pricedUpdated } =
    useEDGAR('424B4', '', 30, 10, 600000);

  // S-1 only (not S-1/A amendments) = filed/in registration
  const { filings: filedFilings, loading: filedLoading, lastUpdated: filedUpdated } =
    useEDGAR('S-1', '', 30, 10, 600000);

  const loading = pricedLoading || filedLoading;
  const lastUpdated = pricedUpdated || filedUpdated;

  return (
    <PanelCard title="IPO Tracker" loading={loading} lastUpdated={lastUpdated} className="min-h-[280px]">
      <div className="max-h-[400px] overflow-y-auto">
        <SectionLabel label="Priced / Trading (424B4)" count={pricedFilings.length} />
        {pricedFilings.length === 0 && !pricedLoading && (
          <p className="text-txt-secondary text-[10px] py-1">No recent 424B4 filings</p>
        )}
        {pricedFilings.map((f, i) => (
          <FilingRow key={`424-${i}`} filing={f} />
        ))}

        <SectionLabel label="Filed / In Registration (S-1)" count={filedFilings.length} />
        {filedFilings.length === 0 && !filedLoading && (
          <p className="text-txt-secondary text-[10px] py-1">No recent S-1 filings</p>
        )}
        {filedFilings.map((f, i) => (
          <FilingRow key={`s1-${i}`} filing={f} />
        ))}
      </div>
    </PanelCard>
  );
}
