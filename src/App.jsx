import { useMemo } from 'react';
import StickyHeader from './components/StickyHeader';
import MainGrid from './components/MainGrid';
import BelowFold from './components/BelowFold';
import useQuotes from './hooks/useQuotes';
import useFRED from './hooks/useFRED';

const ALL_SYMBOLS = [
  '^VIX', '^TNX', '^IRX', 'HYG', 'LQD', '^GSPC',
  '^IXIC', '^RUT', 'MNA', 'MRGR',
];

const FRED_SERIES = ['SOFR', 'BAMLH0A0HYM2', 'DGS10', 'DGS2'];

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const fredSeries = useMemo(() => FRED_SERIES, []);

  const { quotes, loading: quotesLoading, refresh: refreshQuotes } = useQuotes(symbols, 60000);
  const { data: fredData, loading: fredLoading, lastUpdated: fredLastUpdated, refresh: refreshFRED } = useFRED(fredSeries, 3600000);

  async function handleRefreshAll() {
    await Promise.all([refreshQuotes(), refreshFRED()]);
  }

  return (
    <div className="min-h-screen bg-navy text-txt-primary font-sans">
      <StickyHeader quotes={quotes} loading={quotesLoading} onRefresh={handleRefreshAll} />
      <MainGrid
        quotes={quotes}
        quotesLoading={quotesLoading}
        fredData={fredData}
        fredLoading={fredLoading}
        fredLastUpdated={fredLastUpdated}
      />
      <BelowFold />
    </div>
  );
}

export default App;
