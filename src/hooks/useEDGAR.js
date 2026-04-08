import { useState, useEffect, useCallback, useRef } from 'react';

export default function useEDGAR(forms, query = '', days = 30, limit = 20, intervalMs = 600000, enrich = false) {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams({ forms, days: String(days), limit: String(limit) });
      if (query) params.set('q', query);
      if (enrich) params.set('enrich', 'true');
      const res = await fetch(`/api/edgar-8k?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;
      setFilings(json.filings || []);
      setLastUpdated(new Date());
    } catch {
      // silent fail
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [forms, query, days, limit, enrich]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { filings, loading, lastUpdated, refresh: fetchData };
}
