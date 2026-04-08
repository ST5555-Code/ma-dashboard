import { useMemo } from 'react';
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

function FilingItem({ filing }) {
  return (
    <a
      href={filing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold text-txt-primary truncate">
              {filing.company}
            </span>
            {filing.ticker && (
              <span className="text-[9px] text-gold bg-gold/10 px-1.5 py-0.5 rounded font-semibold flex-shrink-0">
                {filing.ticker}
              </span>
            )}
          </div>
          {filing.description && (
            <p className="text-[10px] text-txt-secondary mt-0.5 line-clamp-2">
              {filing.description}
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-[9px] text-txt-secondary">{timeAgo(filing.filedDate)}</span>
        </div>
      </div>
    </a>
  );
}

function SectionLabel({ label, count }) {
  return (
    <div className="flex items-center gap-2 mb-1 mt-2 first:mt-0">
      <span className="text-[9px] font-bold tracking-wider text-gold/70 uppercase">{label}</span>
      <span className="text-[9px] text-txt-secondary">({count})</span>
      <div className="flex-1 border-b border-gold/10" />
    </div>
  );
}

export default function DealFlowPanel() {
  const { filings: eightKFilings, loading: eightKLoading, lastUpdated: eightKUpdated } =
    useEDGAR('8-K', '"1.01"', 14, 15, 600000);

  const { filings: s4Filings, loading: s4Loading, lastUpdated: s4Updated } =
    useEDGAR('S-4', '', 30, 10, 600000);

  const loading = eightKLoading || s4Loading;
  const lastUpdated = eightKUpdated || s4Updated;

  return (
    <PanelCard title="Strategic Deal Flow" loading={loading} lastUpdated={lastUpdated} className="min-h-[320px]">
      <div className="max-h-[500px] overflow-y-auto">
        <SectionLabel label="8-K Material Agreements" count={eightKFilings.length} />
        {eightKFilings.length === 0 && !eightKLoading && (
          <p className="text-txt-secondary text-[10px] py-2">No recent 8-K Item 1.01 filings</p>
        )}
        {eightKFilings.map((f, i) => (
          <FilingItem key={`8k-${i}`} filing={f} />
        ))}

        <SectionLabel label="S-4 Merger Proxies" count={s4Filings.length} />
        {s4Filings.length === 0 && !s4Loading && (
          <p className="text-txt-secondary text-[10px] py-2">No recent S-4 filings</p>
        )}
        {s4Filings.map((f, i) => (
          <FilingItem key={`s4-${i}`} filing={f} />
        ))}
      </div>
    </PanelCard>
  );
}
