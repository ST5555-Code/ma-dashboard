// /api/rss.js — RSS proxy with domain whitelist
// Usage: /api/rss?url=https://news.google.com/rss/search?q=merger

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const ALLOWED_DOMAINS = [
  'news.google.com',
  'reuters.com',
  'ft.com',
  'wsj.com',
  'cnbc.com',
  'prnewswire.com',
  'businesswire.com',
  'buyoutsinsider.com',
  'feeds.bbci.co.uk',
  'feeds.bbc.com',
];

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
      return (m ? (m[1] || m[2] || '') : '').trim();
    };
    items.push({
      title:       get('title'),
      link:        get('link') || get('guid'),
      pubDate:     get('pubDate'),
      description: get('description').replace(/<[^>]+>/g, '').slice(0, 300),
    });
  }
  return items;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const url = (req.query?.url || '').trim();
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  if (!ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d))) {
    return res.status(403).json({ error: 'Domain not allowed' });
  }

  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MADashboard/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!r.ok) return res.status(502).json({ error: `RSS_HTTP_${r.status}` });

    const xml = await r.text();
    const items = parseRSS(xml);

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ items });

  } catch (e) {
    return res.status(502).json({ error: 'RSS_EXCEPTION', msg: e.message });
  }
}
