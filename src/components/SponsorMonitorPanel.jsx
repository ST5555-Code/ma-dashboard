import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from './PanelCard';

function deriveTag(text) {
  const t = text.toLowerCase();
  if (t.includes('take-private') || t.includes('take private') || t.includes('going private'))
    return 'Take-Private';
  if (t.includes('tender offer'))
    return 'Tender Offer';
  if (t.includes('debt commitment') || t.includes('financing commitment') || t.includes('committed financing'))
    return 'Debt Commitments';
  if (t.includes('sponsor exit') || t.includes('secondary offering'))
    return 'Sponsor Exit';
  if (t.includes('sale process') || t.includes('portfolio company') || t.includes('exit'))
    return 'Sale Process';
  if (t.includes('lbo') || t.includes('leveraged buyout') || t.includes('buyout'))
    return 'Take-Private';
  return null;
}

const TAG_COLORS = {
  'Take-Private': 'bg-gold/15 text-gold border-gold/30',
  'Tender Offer': 'bg-neg/15 text-neg border-neg/30',
  'Debt Commitments': 'bg-pos/15 text-pos border-pos/30',
  'Sponsor Exit': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Sale Process': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=%22leveraged+buyout%22+OR+%22take-private%22+OR+%22LBO%22+OR+%22buyout+fund%22&hl=en-US&gl=US&ceid=US:en',
    source: 'Google News',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22private+equity%22+AND+(%22acquisition%22+OR+%22buyout%22+OR+%22take-private%22)&hl=en-US&gl=US&ceid=US:en',
    source: 'Google News',
  },
];

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function cleanTitle(title) {
  return title.replace(/\s-\s[^-]+$/, '').trim();
}

function extractSource(title) {
  const m = title.match(/\s-\s([^-]+)$/);
  return m ? m[1].trim() : null;
}

export default function SponsorMonitorPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchRSS = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        RSS_FEEDS.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.items || []).map(item => ({ ...item, feedSource: feed.source }));
        })
      );
      if (!mountedRef.current) return;

      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      // Deduplicate by cleaned title
      const seen = new Set();
      const tagged = allItems.map(item => {
        const source = extractSource(item.title);
        return {
          ...item,
          title: cleanTitle(item.title),
          source,
          tag: deriveTag(item.title + ' ' + (item.description || '')),
        };
      }).filter(item => {
        if (!item.tag) return false;
        const key = item.title.toLowerCase().slice(0, 50);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      tagged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setItems(tagged.slice(0, 15));
      setLastUpdated(new Date());
    } catch {
      // silent
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchRSS();
    const id = setInterval(fetchRSS, 300000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchRSS]);

  return (
    <PanelCard title="Sponsor / LBO Monitor" loading={loading} lastUpdated={lastUpdated} onRefresh={fetchRSS} className="min-h-[320px]">
      <div className="max-h-[450px] overflow-y-auto">
        {items.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No sponsor/LBO activity</p>
        )}
        {items.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-txt-primary leading-snug">{item.title}</p>
              </div>
              <span className="text-[9px] text-txt-secondary flex-shrink-0">
                {timeAgo(item.pubDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {item.tag && (
                <span className={`text-[8px] font-bold tracking-wide px-1.5 py-0.5 rounded border ${TAG_COLORS[item.tag] || 'bg-white/10 text-txt-secondary border-white/20'}`}>
                  {item.tag}
                </span>
              )}
              {item.source && (
                <span className="text-[8px] text-txt-secondary">{item.source}</span>
              )}
            </div>
          </a>
        ))}
      </div>
    </PanelCard>
  );
}
