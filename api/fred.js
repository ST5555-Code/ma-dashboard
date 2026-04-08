// /api/fred.js — FRED API proxy
// Fetches SOFR, HY OAS, treasury yields
// Accepts: /api/fred?series=SOFR,BAMLH0A0HYM2,DGS10,DGS2

const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

async function fetchSeries(seriesId, apiKey) {
  const url = `${FRED_BASE}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=60`;
  const r = await fetch(url, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`FRED_${r.status}`);
  const data = await r.json();
  const obs = (data.observations || [])
    .filter(o => o.value !== '.')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }));
  return { seriesId, observations: obs, latest: obs[0] || null };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'FRED_API_KEY not configured' });

  const raw = (req.query?.series || '').trim();
  if (!raw) return res.status(400).json({ error: 'Missing series param' });

  const seriesIds = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 10);
  if (!seriesIds.length) return res.status(400).json({ error: 'No valid series' });
  if (seriesIds.some(s => !/^[A-Za-z0-9_]+$/.test(s))) {
    return res.status(400).json({ error: 'Invalid series ID' });
  }

  try {
    const results = await Promise.all(seriesIds.map(id => fetchSeries(id, apiKey)));
    const out = {};
    for (const r of results) out[r.seriesId] = r;
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
