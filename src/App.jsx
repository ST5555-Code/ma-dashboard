import { useMemo } from 'react';
import StickyHeader from './components/StickyHeader';
import MainGrid from './components/MainGrid';
import BelowFold from './components/BelowFold';
import useQuotes from './hooks/useQuotes';

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
      <MainGrid />
      <BelowFold />
    </div>
  );
}

export default App;
