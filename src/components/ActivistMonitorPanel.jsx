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

// Detect filing subtype from form and description
function filingTag(form, description) {
  const f = (form || '').toUpperCase();
  const d = (description || '').toLowerCase();
  if (f.includes('13D/A') || f === 'SC 13D/A') return { label: 'AMENDED', color: 'bg-gold/15 text-gold border-gold/30' };
  if (f.includes('13D')) return { label: 'NEW 13D', color: 'bg-neg/15 text-neg border-neg/30' };
  if (d.includes('proxy') || f.includes('DFAN') || f.includes('DEFA')) return { label: 'PROXY', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
  return null;
}

function FilingRow({ filing }) {
  const tag = filingTag(filing.form, filing.description);
  return (
    <a
      href={filing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-1.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className="text-[11px] text-txt-primary truncate font-medium">{filing.company}</span>
          {filing.ticker && (
            <span className="text-[8px] text-gold bg-gold/10 px-1 py-0.5 rounded font-semibold flex-shrink-0">
              {filing.ticker}
            </span>
          )}
          {tag && (
            <span className={`text-[7px] font-bold tracking-wide px-1 py-0.5 rounded border flex-shrink-0 ${tag.color}`}>
              {tag.label}
            </span>
          )}
        </div>
        <span className="text-[9px] text-txt-secondary flex-shrink-0 ml-2">{timeAgo(filing.filedDate)}</span>
      </div>
      {filing.description && (
        <p className="text-[9px] text-txt-secondary mt-0.5 line-clamp-1">{filing.description}</p>
      )}
    </a>
  );
}

export default function ActivistMonitorPanel() {
  // SC 13D = initial activist stake >5%, SC 13D/A = amendments
  const { filings, loading, lastUpdated, refresh } =
    useEDGAR('SC 13D,SC 13D/A', '', 7, 15, 600000);

  return (
    <PanelCard title="Activist / 13D Monitor" loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} className="flex-1">
      <div className="overflow-y-auto">
        {filings.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No 13D filings this week</p>
        )}
        {filings.map((f, i) => (
          <FilingRow key={i} filing={f} />
        ))}
      </div>
    </PanelCard>
  );
}
