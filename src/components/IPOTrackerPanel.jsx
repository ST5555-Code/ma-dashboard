import { useMemo, useState, useEffect, useRef } from 'react';
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

function fmtMktCap(v) {
  if (v == null) return '';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${(v / 1e3).toFixed(0)}K`;
}

function fmtPrice(v) {
  if (v == null) return '--';
  return `$${v.toFixed(2)}`;
}

function fmtChg(v) {
  if (v == null) return '';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(1)}%`;
}

// Fetch YF quotes for a list of tickers to get mktcap + price + change
function useIPOQuotes(tickers) {
  const [data, setData] = useState({});
  const mountedRef = useRef(true);
  const tickerKey = tickers.join(',');

  useEffect(() => {
    mountedRef.current = true;
    if (!tickers.length) return;

    async function fetch_quotes() {
      try {
        const res = await fetch(`/api/quotes?syms=${tickers.join(',')}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mountedRef.current) return;

        const parsed = {};
        for (const sym of tickers) {
          try {
            const result = json[sym]?.chart?.result?.[0];
            if (!result) continue;
            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const prevClose = meta.chartPreviousClose ?? meta.previousClose;
            const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : null;
            parsed[sym] = {
              price,
              changePct,
              volume: meta.regularMarketVolume || null,
            };
          } catch { /* skip */ }
        }
        setData(parsed);
      } catch { /* silent */ }
    }

    fetch_quotes();
    return () => { mountedRef.current = false; };
  }, [tickerKey]);

  return data;
}

function FilingRow({ filing, tag, quoteData }) {
  const q = quoteData?.[filing.ticker] || null;

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
            <span className={`text-[7px] font-bold tracking-wide px-1 py-0.5 rounded flex-shrink-0 ${tag.color}`}>
              {tag.label}
            </span>
          )}
        </div>
        <span className="text-[9px] text-txt-secondary flex-shrink-0 ml-2">{timeAgo(filing.filedDate)}</span>
      </div>
      {/* Market data row */}
      {q && (
        <div className="flex items-center gap-3 mt-0.5 text-[9px]">
          <span className="text-txt-secondary">{fmtPrice(q.price)}</span>
          {q.changePct != null && (
            <span className={q.changePct >= 0 ? 'text-pos' : 'text-neg'}>
              {fmtChg(q.changePct)}
            </span>
          )}
          {q.volume && (
            <span className="text-txt-secondary">Vol {(q.volume / 1e6).toFixed(1)}M</span>
          )}
        </div>
      )}
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
  // Last 7 days
  const { filings: pricedFilings, loading: pricedLoading, lastUpdated: pricedUpdated } =
    useEDGAR('424B4', '', 7, 20, 600000);

  const { filings: filedFilings, loading: filedLoading, lastUpdated: filedUpdated } =
    useEDGAR('S-1', '', 7, 20, 600000);

  const loading = pricedLoading || filedLoading;
  const lastUpdated = pricedUpdated || filedUpdated;

  // Collect all tickers from priced filings for YF enrichment
  const pricedTickers = useMemo(() => {
    return pricedFilings
      .filter(f => f.ticker)
      .map(f => f.ticker)
      .slice(0, 20);
  }, [pricedFilings]);

  const quoteData = useIPOQuotes(pricedTickers);

  // Separate SPACs, filter priced IPOs to mktcap > $200M
  const { pricedIPOs, pricedSPACs } = useMemo(() => {
    const ipos = [];
    const spacs = [];
    for (const f of pricedFilings) {
      if (isSPAC(f.company)) {
        spacs.push(f);
        continue;
      }
      // Filter out micro-caps: price < $10 as proxy (no free mktcap API)
      const q = f.ticker ? quoteData[f.ticker] : null;
      if (q?.price && q.price < 10) continue;
      ipos.push(f);
    }
    return { pricedIPOs: ipos, pricedSPACs: spacs };
  }, [pricedFilings, quoteData]);

  const { filedIPOs, filedSPACs } = useMemo(() => {
    const ipos = [];
    const spacs = [];
    for (const f of filedFilings) {
      (isSPAC(f.company) ? spacs : ipos).push(f);
    }
    return { filedIPOs: ipos, filedSPACs: spacs };
  }, [filedFilings]);

  const totalSPACs = pricedSPACs.length + filedSPACs.length;

  return (
    <PanelCard title="IPO Tracker (7d)" loading={loading} lastUpdated={lastUpdated} className="min-h-[280px]">
      <div className="max-h-[500px] overflow-y-auto">
        {/* Priced IPOs — >$200M market cap */}
        <SectionLabel label="Priced IPOs" count={pricedIPOs.length} />
        {pricedIPOs.length === 0 && <EmptyState loading={pricedLoading} message="No priced IPOs this week" />}
        {pricedIPOs.map((f, i) => (
          <FilingRow key={`p-${i}`} filing={f} quoteData={quoteData} />
        ))}

        {/* New S-1 Filings */}
        <SectionLabel label="New S-1 Filings" count={filedIPOs.length} />
        {filedIPOs.length === 0 && <EmptyState loading={filedLoading} message="No new S-1 filings this week" />}
        {filedIPOs.map((f, i) => (
          <FilingRow key={`s-${i}`} filing={f} quoteData={quoteData} />
        ))}

        {/* SPACs */}
        <SectionLabel label="SPACs" count={totalSPACs} />
        {totalSPACs === 0 && <EmptyState loading={loading} message="No SPAC activity this week" />}
        {pricedSPACs.map((f, i) => (
          <FilingRow
            key={`sp-${i}`}
            filing={f}
            quoteData={quoteData}
            tag={{ label: 'PRICED', color: 'bg-pos/15 text-pos border border-pos/30' }}
          />
        ))}
        {filedSPACs.map((f, i) => (
          <FilingRow
            key={`sf-${i}`}
            filing={f}
            quoteData={quoteData}
            tag={{ label: 'FILED', color: 'bg-gold/15 text-gold border border-gold/30' }}
          />
        ))}
      </div>
    </PanelCard>
  );
}
