import { useState, useEffect, useRef } from 'react';
import MarqueeModule from 'react-fast-marquee';
const Marquee = MarqueeModule.default || MarqueeModule;

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtChg(v) {
  if (v == null) return '';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

export default function TickerTape() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function fetchTrending() {
      try {
        const res = await fetch('/api/trending');
        if (!res.ok) return;
        const data = await res.json();
        if (!mountedRef.current) return;

        const tickers = (data.symbols || []).map(sym => {
          const q = data.quotes?.[sym];
          return q ? { sym, name: q.name, price: q.price, changePct: q.changePct } : null;
        }).filter(Boolean);

        setItems(tickers);
      } catch {
        // silent
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetchTrending();
    const id = setInterval(fetchTrending, 60000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="bg-navy-panel border-b border-gold/30 flex items-center">
      {/* Fixed label */}
      <div className="bg-gold text-navy text-[10px] font-bold py-2 tracking-wider flex-shrink-0 z-10 w-[70px] text-center">
        ACTIVE
      </div>
      {/* Scrolling tape */}
      <div className="flex-1 overflow-hidden py-1.5">
        {loading && items.length === 0 ? (
          <div className="text-txt-secondary text-[12px] px-5">Loading trending stocks...</div>
        ) : items.length === 0 ? (
          <div className="text-txt-secondary text-[12px] px-5">No trending data</div>
        ) : (
          <Marquee speed={40} pauseOnHover gradient={false}>
            {items.map((item) => (
              <div
                key={item.sym}
                className="inline-flex items-center gap-1.5 px-4 border-r border-[#3a4570] text-[12px]"
              >
                <span className="text-white font-semibold">{item.sym}</span>
                <span className="text-white/40 text-[10px] max-w-[100px] truncate">{item.name}</span>
                <span className="text-white">{fmt(item.price)}</span>
                <span className={colorClass(item.changePct)}>{fmtChg(item.changePct)}</span>
              </div>
            ))}
          </Marquee>
        )}
      </div>
    </div>
  );
}
