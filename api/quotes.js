// /api/quotes.js — Batch Yahoo Finance proxy
// Accepts: /api/quotes?syms=^VIX,^TNX,HYG&range=ytd&interval=1d
// Primary: Cloudflare Worker. Fallback: AllOrigins relay.

const ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const CF_PROXY = 'https://yf-proxy.mktdash.workers.dev';

async function fetchViaCF(sym, range, interval) {
  const params = new URLSearchParams({ sym });
  if (range) params.set('range', range);
  if (interval) params.set('interval', interval);
  const r = await fetch(`${CF_PROXY}/?${params}`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`CF_${r.status}`);
  return r.json();
}

async function fetchViaAllOrigins(sym, range, interval) {
  const yfUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=${range || '5d'}&interval=${interval || '1d'}`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yfUrl)}`;
  const r = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`ALLORIGINS_${r.status}`);
  const envelope = await r.json();
  if (!envelope?.contents) throw new Error('ALLORIGINS_EMPTY');
  return JSON.parse(envelope.contents);
}

async function fetchOne(sym, range, interval) {
  // If range is beyond what CF proxy supports (it only does 5d), skip to AllOrigins
  const needsLongRange = range && range !== '5d' && range !== '1d';

  if (!needsLongRange) {
    try {
      return { sym, data: await fetchViaCF(sym, range, interval) };
    } catch {
      // fall through to AllOrigins
    }
  }

  try {
    return { sym, data: await fetchViaAllOrigins(sym, range, interval) };
  } catch (e) {
    // Last resort: try CF anyway
    try {
      return { sym, data: await fetchViaCF(sym, range, interval) };
    } catch (e2) {
      return { sym, error: e.message };
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Content-Type', 'application/json');

  const raw = (req.query?.syms || '').trim();
  if (!raw) return res.status(400).json({ error: 'Missing syms' });

  const range = (req.query?.range || '').trim() || undefined;
  const interval = (req.query?.interval || '').trim() || undefined;

  const syms = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20);
  if (!syms.length) return res.status(400).json({ error: 'No valid symbols' });
  if (syms.some(s => !/^[A-Za-z0-9.\-=^]+$/.test(s))) {
    return res.status(400).json({ error: 'Invalid symbol in list' });
  }

  try {
    const results = await Promise.all(syms.map(s => fetchOne(s, range, interval)));
    const out = {};
    for (const r of results) out[r.sym] = r.data || { error: r.error };
    res.setHeader('Cache-Control', 'public, max-age=90');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
