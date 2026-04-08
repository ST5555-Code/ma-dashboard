import PanelCard from './PanelCard';

function fmt(v) {
  if (v == null) return '--';
  return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(v) {
  if (v == null) return '--';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}

function colorClass(v) {
  if (v == null || v === 0) return 'text-txt-secondary';
  return v > 0 ? 'text-pos' : 'text-neg';
}

function computeSignal(vix, hygChangePct) {
  if (vix == null) return { label: '--', color: 'text-txt-secondary border-white/20 bg-white/5' };
  if (vix < 18 && (hygChangePct == null || hygChangePct > -0.3)) {
    return { label: 'TIGHT', color: 'text-pos border-pos/30 bg-pos/10' };
  }
  if (vix > 25 || (hygChangePct != null && hygChangePct < -1)) {
    return { label: 'WIDE', color: 'text-neg border-neg/30 bg-neg/10' };
  }
  return { label: 'NORMAL', color: 'text-gold border-gold/30 bg-gold/10' };
}

export default function DealEnvironmentPanel({ quotes, loading, lastUpdated }) {
  const mna = quotes?.['MNA'];
  const mrgr = quotes?.['MRGR'];
  const vix = quotes?.['^VIX']?.price;
  const hygChg = quotes?.['HYG']?.changePct;
  const signal = computeSignal(vix, hygChg);

  return (
    <PanelCard title="Deal Environment" loading={loading} lastUpdated={lastUpdated}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-txt-secondary">MNA</span>
            <span className="text-[13px] text-txt-primary font-semibold tabular-nums">{fmt(mna?.price)}</span>
            <span className={`text-[10px] tabular-nums ${colorClass(mna?.changePct)}`}>{fmtPct(mna?.changePct)}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-txt-secondary">MRGR</span>
            <span className="text-[13px] text-txt-primary font-semibold tabular-nums">{fmt(mrgr?.price)}</span>
            <span className={`text-[10px] tabular-nums ${colorClass(mrgr?.changePct)}`}>{fmtPct(mrgr?.changePct)}</span>
          </div>
        </div>
        <div className={`py-1.5 px-4 rounded border text-[12px] font-bold tracking-wider ${signal.color}`}>
          {signal.label}
        </div>
      </div>
    </PanelCard>
  );
}
