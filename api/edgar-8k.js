// /api/edgar-8k.js — EDGAR filing search proxy
// Fetches recent 8-K (Item 1.01), S-4, 424B4, S-1, Schedule TO filings
// Accepts: /api/edgar-8k?forms=8-K,S-4&days=30&limit=20

const EFTS_BASE = 'https://efts.sec.gov/LATEST/search-index';
const EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const USER_AGENT = 'ma-dashboard serge.tismen@gmail.com';

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function searchFilings(forms, query, days, limit) {
  const params = new URLSearchParams({
    forms,
    dateRange: 'custom',
    startdt: dateStr(days),
    enddt: dateStr(0),
    from: '0',
    size: String(limit),
  });
  if (query) params.set('q', query);

  const url = `${EDGAR_SEARCH}?${params}`;
  const r = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`EDGAR_${r.status}`);
  const data = await r.json();

  return (data.hits?.hits || []).map(h => {
    const s = h._source;
    // Clean company name: strip CIK, ticker suffixes from EDGAR display_names
    let rawName = s.display_names?.[0] || s.entity_name || 'Unknown';
    rawName = rawName.replace(/\s*\(CIK\s*\d+\)\s*/gi, '').replace(/\s*\([A-Z0-9, -]+\)\s*$/g, '').trim();
    // Extract ticker from tickers array or from parenthetical in display name
    let ticker = s.tickers?.[0] || null;
    if (!ticker) {
      const m = (s.display_names?.[0] || '').match(/\(([A-Z]{1,5})\)/);
      if (m) ticker = m[1];
    }
    return {
      company: rawName,
      ticker,
      cik: s.entity_id || null,
      form: s.form_type,
      filedDate: s.file_date,
      description: s.file_description || '',
      url: s.file_num
        ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${s.file_num}&type=&dateb=&owner=include&count=10`
        : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${s.entity_id}&type=${encodeURIComponent(forms)}&dateb=&owner=include&count=10`,
      accession: h._id || null,
    };
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const forms = (req.query?.forms || '8-K').trim();
  const query = (req.query?.q || '').trim();
  const days = Math.min(parseInt(req.query?.days || '30', 10), 90);
  const limit = Math.min(parseInt(req.query?.limit || '20', 10), 50);

  try {
    const filings = await searchFilings(forms, query, days, limit);
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ filings, count: filings.length, forms, query });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
