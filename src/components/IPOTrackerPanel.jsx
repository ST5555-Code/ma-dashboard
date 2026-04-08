import { useMemo } from 'react';
import PanelCard from './PanelCard';
import useEDGAR from '../hooks/useEDGAR';

const SPAC_PATTERNS = [
  /acquisition\s+corp/i,
  /blank\s+check/i,
  /special\s+purpose/i,
  /acquisition\s+holdings/i,
  /merger\s+corp/i,
  /capital\s+acquisition/i,
  /sponsor\s+acquisition/i,
  /\bspac\b/i,
];

function isSPAC(company) {
  return SPAC_PATTERNS.some(p => p.test(company));
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  return `${days}d ago`;
}

function FilingRow({ filing, tag }) {
  return (
    <a
      href={filing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span className="text-[11px] text-txt-primary truncate font-medium">{filing.company}</span>
        {filing.ticker && (
          <span className="text-[8px] text-gold bg-gold/10 px-1 py-0.5 rounded font-semibold flex-shrink-0">
            {filing.ticker}
          </span>
        )}
        {tag && (
          <span className={`text-[7px] font-bold tracking-wide px-1 py-0.5 rounded flex-shrink-0 ${tag.color}`}>
            {tag.label}
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

function EmptyState({ loading, message }) {
  if (loading) return null;
  return <p className="text-txt-secondary text-[10px] py-1">{message}</p>;
}

export default function IPOTrackerPanel() {
  const { filings: pricedFilings, loading: pricedLoading, lastUpdated: pricedUpdated } =
    useEDGAR('424B4', '', 30, 15, 600000);

  const { filings: filedFilings, loading: filedLoading, lastUpdated: filedUpdated } =
    useEDGAR('S-1', '', 30, 15, 600000);

  const loading = pricedLoading || filedLoading;
  const lastUpdated = pricedUpdated || filedUpdated;

  // Separate SPACs from regular IPOs
  const { pricedIPOs, pricedSPACs } = useMemo(() => {
    const ipos = [];
    const spacs = [];
    for (const f of pricedFilings) {
      (isSPAC(f.company) ? spacs : ipos).push(f);
    }
    return { pricedIPOs: ipos, pricedSPACs: spacs };
  }, [pricedFilings]);

  const { filedIPOs, filedSPACs } = useMemo(() => {
    const ipos = [];
    const spacs = [];
    for (const f of filedFilings) {
      (isSPAC(f.company) ? spacs : ipos).push(f);
    }
    return { filedIPOs: ipos, filedSPACs: spacs };
  }, [filedFilings]);

  const spacPriced = pricedSPACs;
  const spacFiled = filedSPACs;
  const totalSPACs = spacPriced.length + spacFiled.length;

  return (
    <PanelCard title="IPO Tracker" loading={loading} lastUpdated={lastUpdated} className="min-h-[280px]">
      <div className="max-h-[500px] overflow-y-auto">
        {/* Priced IPOs */}
        <SectionLabel label="Priced IPOs" count={pricedIPOs.length} />
        {pricedIPOs.length === 0 && <EmptyState loading={pricedLoading} message="No recent priced IPOs" />}
        {pricedIPOs.map((f, i) => (
          <FilingRow key={`p-${i}`} filing={f} />
        ))}

        {/* New S-1 Filings */}
        <SectionLabel label="New S-1 Filings" count={filedIPOs.length} />
        {filedIPOs.length === 0 && <EmptyState loading={filedLoading} message="No recent S-1 filings" />}
        {filedIPOs.map((f, i) => (
          <FilingRow key={`s-${i}`} filing={f} />
        ))}

        {/* SPACs */}
        <SectionLabel label="SPACs" count={totalSPACs} />
        {totalSPACs === 0 && <EmptyState loading={loading} message="No recent SPAC activity" />}
        {spacPriced.map((f, i) => (
          <FilingRow
            key={`sp-${i}`}
            filing={f}
            tag={{ label: 'PRICED', color: 'bg-pos/15 text-pos border border-pos/30' }}
          />
        ))}
        {spacFiled.map((f, i) => (
          <FilingRow
            key={`sf-${i}`}
            filing={f}
            tag={{ label: 'FILED', color: 'bg-gold/15 text-gold border border-gold/30' }}
          />
        ))}
      </div>
    </PanelCard>
  );
}
