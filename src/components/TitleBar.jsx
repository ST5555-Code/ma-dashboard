import { useState, useEffect } from 'react';

function Clock() {
  const [time, setTime] = useState('--:-- --');

  useEffect(() => {
    function tick() {
      setTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="text-gold font-semibold text-sm">{time}</span>;
}

export default function TitleBar({ onRefresh }) {
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    if (loading) return;
    setLoading(true);
    if (onRefresh) await onRefresh();
    setLoading(false);
  }

  return (
    <div className="bg-navy border-b-[3px] border-gold px-5 py-2.5 flex items-center justify-between">
      <div>
        <div className="text-[16px] font-bold tracking-[2px] text-white uppercase">
          M&A <span className="text-gold">Intelligence</span> Monitor
        </div>
        <div className="text-[10px] text-txt-secondary mt-0.5">
          Deal Flow · Financing · Regulatory · Market Signals
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <Clock />
          <div className="text-[10px] text-txt-secondary">
            Live Data · Stocks 60s · Feeds 10min
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-navy-panel border border-gold text-gold text-[10px] px-2.5 py-1 rounded-sm tracking-wide cursor-pointer font-sans hover:bg-gold hover:text-navy transition-all disabled:opacity-50"
        >
          {loading ? '↻ LOADING...' : '↻ REFRESH ALL'}
        </button>
      </div>
    </div>
  );
}
