import { useState, useEffect, useCallback, useRef } from 'react';

function parseHistory(raw) {
  try {
    const result = raw?.chart?.result?.[0];
    if (!result) return [];
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    return timestamps.map((ts, i) => ({
      date: new Date(ts * 1000).toISOString().slice(0, 10),
      value: closes[i] != null ? Math.round(closes[i] * 100) / 100 : null,
    })).filter(d => d.value != null);
  } catch {
    return [];
  }
}

export default function useYFHistory(symbol, range = 'ytd', interval = '1d', intervalMs = 3600000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/quotes?syms=${symbol}&range=${range}&interval=${interval}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;
      const history = parseHistory(json[symbol]);
      if (history.length) {
        setData(history);
        setLastUpdated(new Date());
      }
    } catch {
      // silent
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [symbol, range, interval]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, lastUpdated, refresh: fetchData };
}
