import { useMemo } from 'react';
import StickyHeader from './components/StickyHeader';
import useQuotes from './hooks/useQuotes';

// Deduplicated union of MarketsBar + TickerTape symbols
const ALL_SYMBOLS = [
  '^VIX', '^TNX', '^IRX', 'HYG', 'LQD', '^GSPC',
  '^IXIC', '^RUT', 'MNA', 'MRGR',
];

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const { quotes, loading, refresh } = useQuotes(symbols, 60000);

  return (
    <div className="min-h-screen bg-navy text-txt-primary font-sans">
      <StickyHeader quotes={quotes} loading={loading} onRefresh={refresh} />

      <main className="p-4">
        <div className="rounded-lg bg-navy-panel border border-gold/20 p-8 text-center">
          <p className="text-txt-secondary text-sm">
            Step 3 complete — MarketsBar and TickerTape wired to live Yahoo Finance data.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
