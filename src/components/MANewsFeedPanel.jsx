import { useState, useEffect, useCallback, useRef } from 'react';
import PanelCard from './PanelCard';

// Google News RSS with M&A keywords — most reliable free source
// FT/WSJ RSS are gated; these are fallback-safe
const FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=merger+OR+acquisition+OR+%22strategic+alternatives%22+OR+%22take-private%22&hl=en-US&gl=US&ceid=US:en',
    source: 'Google News',
  },
  {
    url: 'https://news.google.com/rss/search?q=buyout+OR+LBO+OR+%22leveraged+buyout%22+OR+%22definitive+agreement%22&hl=en-US&gl=US&ceid=US:en',
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

function extractSource(title) {
  // Google News appends " - Source Name" at the end
  const m = title.match(/\s-\s([^-]+)$/);
  return m ? m[1].trim() : null;
}

function cleanTitle(title) {
  return title.replace(/\s-\s[^-]+$/, '').trim();
}

export default function MANewsFeedPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchFeeds = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        FEEDS.map(async (feed) => {
          const res = await fetch(`/api/rss?url=${encodeURIComponent(feed.url)}`);
          if (!res.ok) return [];
          const json = await res.json();
          return (json.items || []).map(item => ({ ...item, feedSource: feed.source }));
        })
      );

      if (!mountedRef.current) return;

      // Merge, deduplicate by title, sort by date
      const allItems = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value);

      const seen = new Set();
      const deduped = allItems.filter(item => {
        const key = cleanTitle(item.title).toLowerCase().slice(0, 60);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      deduped.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setItems(deduped.slice(0, 15));
      setLastUpdated(new Date());
    } catch {
      // silent fail
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchFeeds();
    const id = setInterval(fetchFeeds, 300000); // 5 min
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchFeeds]);

  return (
    <PanelCard title="M&A News Feed" loading={loading} lastUpdated={lastUpdated} className="min-h-[280px]">
      <div className="max-h-[400px] overflow-y-auto">
        {items.length === 0 && !loading && (
          <p className="text-txt-secondary text-[10px] py-4 text-center">No headlines available</p>
        )}
        {items.map((item, i) => {
          const source = extractSource(item.title);
          const title = cleanTitle(item.title);
          return (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-1 px-1 rounded transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[12px] text-txt-primary leading-snug flex-1 min-w-0">
                  {title}
                </p>
                <span className="text-[9px] text-txt-secondary flex-shrink-0">
                  {timeAgo(item.pubDate)}
                </span>
              </div>
              {source && (
                <span className="text-[9px] text-gold/60 mt-0.5 inline-block">
                  {source}
                </span>
              )}
            </a>
          );
        })}
      </div>
    </PanelCard>
  );
}
