// /api/edgar-8k.js — EDGAR filing search proxy
// Fetches recent 8-K (Item 1.01), S-4, 424B4, S-1, Schedule TO filings
// Accepts: /api/edgar-8k?forms=8-K,S-4&days=30&limit=20&enrich=true

const EDGAR_SEARCH = 'https://efts.sec.gov/LATEST/search-index';
const USER_AGENT = 'ma-dashboard serge.tismen@gmail.com';

function dateStr(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// Parse 424B4 cover page for offering size
async function parseOfferSize(cik, accession, filename) {
  try {
    const acc = accession.replace(/-/g, '');
    const url = `https://www.sec.gov/Archives/edgar/data/${cik.replace(/^0+/, '')}/${acc}/${filename}`;
    const r = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;

    // Read first 25KB — cover page has the offering terms
    const reader = r.body.getReader();
    let text = '';
    while (text.length < 25000) {
      const { done, value } = await reader.read();
      if (done) break;
      text += new TextDecoder().decode(value);
    }
    reader.cancel();

    // Strip HTML tags, collapse whitespace
    text = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, ' ').replace(/\s+/g, ' ');

    // Look for offer price — multiple patterns, wider gaps for table-based layouts
    const priceMatch = text.match(/offering\s+price\s+of\s+\$([0-9,.]+)/i)
      || text.match(/price\s+of\s+\$([0-9,.]+)\s+per\s+share/i)
      || text.match(/public\s+offering\s+price[\s\S]{0,500}?\$([0-9,.]+)\s+per\s+share/i)
      || text.match(/\$([0-9,.]+)\s+per\s+share[\s\S]{0,200}?public\s+offering\s+price/i)
      || text.match(/price\s+to\s+public[\s\S]{0,200}?\$([0-9,.]+)/i)
      || text.match(/at\s+a\s+price\s+of\s+\$([0-9,.]+)/i);

    // Look for total shares offered — first large number followed by "shares"
    const sharesMatch = text.match(/([0-9,]+(?:,\d{3})+)\s+(?:shares|Shares)/);

    if (!priceMatch || !sharesMatch) return null;

    const price = parseFloat(priceMatch[1].replace(/,/g, ''));
    const shares = parseInt(sharesMatch[1].replace(/,/g, ''), 10);

    if (isNaN(price) || isNaN(shares) || price < 1 || shares < 1000) return null;

    return {
      offerPrice: price,
      sharesOffered: shares,
      offerSize: price * shares,
    };
  } catch {
    return null;
  }
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
    let rawName = s.display_names?.[0] || s.entity_name || 'Unknown';
    rawName = rawName.replace(/\s*\(CIK\s*\d+\)\s*/gi, '').replace(/\s*\([A-Z0-9, -]+\)\s*$/g, '').trim();
    let ticker = s.tickers?.[0] || null;
    if (!ticker) {
      const m = (s.display_names?.[0] || '').match(/\(([A-Z]{1,5})\)/);
      if (m) ticker = m[1];
    }

    const filingId = h._id || '';
    const parts = filingId.split(':');
    const accession = parts[0] || '';
    const filename = parts[1] || '';
    const cik = s.ciks?.[0] || s.entity_id || '';

    return {
      company: rawName,
      ticker,
      cik,
      form: s.form_type,
      filedDate: s.file_date,
      description: s.file_description || '',
      url: s.file_num
        ? `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&filenum=${s.file_num}&type=&dateb=&owner=include&count=10`
        : `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${cik}&type=${encodeURIComponent(forms)}&dateb=&owner=include&count=10`,
      accession,
      filename,
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
  const enrich = req.query?.enrich === 'true';

  try {
    const filings = await searchFilings(forms, query, days, limit);

    // Enrich 424B4 filings with offer size parsing
    if (enrich && forms.includes('424B4')) {
      const enriched = await Promise.all(
        filings.map(async (f) => {
          if (f.accession && f.filename && f.cik) {
            const offer = await parseOfferSize(f.cik, f.accession, f.filename);
            if (offer) return { ...f, ...offer };
          }
          return f;
        })
      );
      res.setHeader('Cache-Control', 'public, max-age=600');
      return res.status(200).json({ filings: enriched, count: enriched.length, forms, query });
    }

    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ filings, count: filings.length, forms, query });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
