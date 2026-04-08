// /api/trending.js — Yahoo Finance trending/most active tickers
// Returns top trending US symbols with prices

const USER_AGENT = 'Mozilla/5.0 (compatible; MADashboard/1.0)';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    // Fetch trending symbols
    const trendRes = await fetch('https://query1.finance.yahoo.com/v1/finance/trending/US', {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    if (!trendRes.ok) throw new Error(`YF_TRENDING_${trendRes.status}`);
    const trendData = await trendRes.json();
    const symbols = (trendData?.finance?.result?.[0]?.quotes || [])
      .map(q => q.symbol)
      .filter(s => !s.includes('-') && !s.includes('.')) // exclude crypto, preferred shares
      .slice(0, 15);

    if (!symbols.length) {
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.status(200).json({ symbols: [], quotes: {} });
    }

    // Fetch prices for trending symbols via chart API
    const results = await Promise.all(
      symbols.map(async (sym) => {
        try {
          const r = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1d&interval=1d`,
            { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(8000) }
          );
          if (!r.ok) return null;
          const data = await r.json();
          const meta = data?.chart?.result?.[0]?.meta;
          if (!meta) return null;
          const price = meta.regularMarketPrice;
          const prevClose = meta.chartPreviousClose ?? meta.previousClose;
          const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          return {
            sym,
            name: meta.shortName || meta.symbol || sym,
            price,
            changePct,
          };
        } catch {
          return null;
        }
      })
    );

    const quotes = {};
    for (const r of results) {
      if (r) quotes[r.sym] = r;
    }

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json({ symbols, quotes });
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
}
