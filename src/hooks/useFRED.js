import { useState, useEffect, useCallback, useRef } from 'react';

export default function useFRED(seriesIds, intervalMs = 3600000) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/fred?series=${seriesIds.join(',')}`);
      if (!res.ok) return;
      const json = await res.json();
      if (!mountedRef.current) return;
      setData(json);
      setLastUpdated(new Date());
    } catch {
      // silent fail — keep stale data
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [seriesIds]);

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
