import { useState, useEffect, useCallback, useRef } from 'react';

function parseYFResponse(sym, raw) {
  try {
    const result = raw?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose;
    const change = prevClose ? price - prevClose : 0;
    const changePct = prevClose ? (change / prevClose) * 100 : 0;
    return {
      sym,
      name: meta.shortName || meta.symbol || sym,
      price,
      change,
      changePct,
      currency: meta.currency,
    };
  } catch {
    return null;
  }
}

export default function useQuotes(symbols, intervalMs = 60000) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes?syms=${symbols.join(',')}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!mountedRef.current) return;

      const parsed = {};
      for (const sym of symbols) {
        const q = parseYFResponse(sym, data[sym]);
        if (q) parsed[sym] = q;
      }
      setQuotes(parsed);
      setLastUpdated(new Date());
    } catch {
      // silent fail — keep stale data
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    mountedRef.current = true;
    fetchQuotes();
    const id = setInterval(fetchQuotes, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchQuotes, intervalMs]);

  return { quotes, loading, lastUpdated, refresh: fetchQuotes };
}
