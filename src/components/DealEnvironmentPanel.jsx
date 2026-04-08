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

// Composite signal: VIX + HYG spread thresholds
function computeSignal(vix, hygChangePct) {
  if (vix == null) return { label: '--', color: 'text-txt-secondary border-white/20 bg-white/5' };

  // TIGHT = low vol + HY performing well = good for deals
  // WIDE = high vol + HY selling off = bad for deals
  if (vix < 18 && (hygChangePct == null || hygChangePct > -0.3)) {
    return { label: 'TIGHT', color: 'text-pos border-pos/30 bg-pos/10' };
  }
  if (vix > 25 || (hygChangePct != null && hygChangePct < -1)) {
    return { label: 'WIDE', color: 'text-neg border-neg/30 bg-neg/10' };
  }
  return { label: 'NORMAL', color: 'text-gold border-gold/30 bg-gold/10' };
}

function ETFRow({ label, quote }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[11px] text-txt-secondary font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-txt-primary font-semibold tabular-nums">
          {fmt(quote?.price)}
        </span>
        <span className={`text-[11px] tabular-nums ${colorClass(quote?.changePct)}`}>
          {fmtPct(quote?.changePct)}
        </span>
      </div>
    </div>
  );
}

export default function DealEnvironmentPanel({ quotes, loading, lastUpdated }) {
  const mna = quotes?.['MNA'];
  const mrgr = quotes?.['MRGR'];
  const vix = quotes?.['^VIX']?.price;
  const hygChg = quotes?.['HYG']?.changePct;
  const signal = computeSignal(vix, hygChg);

  return (
    <PanelCard title="Deal Environment" loading={loading} lastUpdated={lastUpdated} className="min-h-[140px]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* ETF prices */}
        <div>
          <ETFRow label="MNA (IQ Merger Arb)" quote={mna} />
          <ETFRow label="MRGR (ProShares Merger Arb)" quote={mrgr} />
        </div>

        {/* Composite signal */}
        <div className="flex justify-center">
          <div className={`py-3 px-6 rounded border text-center ${signal.color}`}>
            <div className="text-[9px] tracking-wider mb-1 opacity-70">DEAL TAPE</div>
            <div className="text-[18px] font-bold tracking-wider">{signal.label}</div>
          </div>
        </div>

        {/* Context */}
        <div className="text-[10px] text-txt-secondary space-y-1">
          <div className="flex justify-between">
            <span>VIX</span>
            <span className="text-txt-primary font-medium">{fmt(vix)}</span>
          </div>
          <div className="flex justify-between">
            <span>HYG daily</span>
            <span className={colorClass(hygChg)}>{fmtPct(hygChg)}</span>
          </div>
        </div>
      </div>
    </PanelCard>
  );
}
