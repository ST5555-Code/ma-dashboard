import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from './PanelCard';
import useEDGAR from '../hooks/useEDGAR';

// Tag logic: keyword matching on headline/description
function deriveTag(text) {
  const t = text.toLowerCase();
  if (t.includes('take-private') || t.includes('take private') || t.includes('going private'))
    return 'Take-Private';
  if (t.includes('tender offer') || t.includes('schedule to'))
    return 'TO Filed';
  if (t.includes('debt commitment') || t.includes('financing commitment') || t.includes('committed financing'))
    return 'Debt Commitments';
  if (t.includes('sponsor exit') || t.includes('ipo') || t.includes('secondary offering'))
    return 'Sponsor Exit';
  if (t.includes('sale process') || t.includes('portfolio company') || t.includes('exit'))
    return 'Sale Process';
  if (t.includes('lbo') || t.includes('leveraged buyout') || t.includes('buyout'))
    return 'Take-Private';
  return null;
}

const TAG_COLORS = {
  'Take-Private': 'bg-gold/15 text-gold border-gold/30',
  'TO Filed': 'bg-neg/15 text-neg border-neg/30',
  'Debt Commitments': 'bg-pos/15 text-pos border-pos/30',
  'Sponsor Exit': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  'Sale Process': 'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

const RSS_FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=%22leveraged+buyout%22+OR+%22take-private%22+OR+%22LBO%22+OR+%22buyout+fund%22&hl=en-US&gl=US&ceid=US:en',
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

export default function SponsorMonitorPanel() {
  const [rssItems, setRssItems] = useState([]);
  const [rssLoading, setRssLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  // Schedule TO from EDGAR
  const { filings: toFilings, loading: toLoading } =
    useEDGAR('SC TO-T,SC TO-C,SC 14D9', '', 30, 10, 600000);

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

      // Tag each item
      const tagged = allItems.map(item => ({
        ...item,
        title: cleanTitle(item.title),
        tag: deriveTag(item.title + ' ' + (item.description || '')),
      })).filter(item => item.tag); // Only show items that match a tag

      tagged.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setRssItems(tagged.slice(0, 12));
      setLastUpdated(new Date());
    } catch {
      // silent
    } finally {
      if (mountedRef.current) setRssLoading(false);
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

  const loading = rssLoading || toLoading;

  // Merge EDGAR Schedule TO filings into the list
  const edgarItems = toFilings.map(f => ({
    title: f.company,
    link: f.url,
    pubDate: f.filedDate,
    tag: 'TO Filed',
    description: f.form,
  }));

  const allItems = [...rssItems, ...edgarItems]
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 15);

  return (
    <PanelCard title="Sponsor / LBO Monitor" loading={loading} lastUpdated={lastUpdated} className="min-h-[320px]">
      <div className="max-h-[450px] overflow-y-auto">
        {allItems.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No sponsor/LBO activity</p>
        )}
        {allItems.map((item, i) => (
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
            {item.tag && (
              <span className={`inline-block text-[8px] font-bold tracking-wide mt-1 px-1.5 py-0.5 rounded border ${TAG_COLORS[item.tag] || 'bg-white/10 text-txt-secondary border-white/20'}`}>
                {item.tag}
              </span>
            )}
          </a>
        ))}
      </div>
    </PanelCard>
  );
}
