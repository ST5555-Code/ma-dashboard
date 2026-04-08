import { useMemo, Component } from 'react';
import StickyHeader from './components/StickyHeader';
import TopRow from './components/TopRow';
import MainGrid from './components/MainGrid';
import useQuotes from './hooks/useQuotes';
import useFRED from './hooks/useFRED';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error: error.message };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#1E2846', color: '#C94040', padding: 40, fontFamily: 'monospace' }}>
          <h1 style={{ color: '#DCB96E' }}>Dashboard Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const ALL_SYMBOLS = [
  '^VIX', '^TNX', '^IRX', '^GSPC',
  '^IXIC', '^RUT', 'MNA', 'MRGR',
];

const FRED_SERIES = ['SOFR', 'BAMLH0A0HYM2', 'BAMLC0A0CM', 'DGS10', 'DGS2'];

function App() {
  const symbols = useMemo(() => ALL_SYMBOLS, []);
  const fredSeries = useMemo(() => FRED_SERIES, []);

  const { quotes, loading: quotesLoading, refresh: refreshQuotes } = useQuotes(symbols, 60000);
  const { data: fredData, loading: fredLoading, lastUpdated: fredLastUpdated, refresh: refreshFRED } = useFRED(fredSeries, 1800000);

  async function handleRefreshAll() {
    await Promise.all([refreshQuotes(), refreshFRED()]);
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-navy text-txt-primary font-sans">
        <StickyHeader quotes={quotes} loading={quotesLoading} fredData={fredData} onRefresh={handleRefreshAll} />
        <TopRow fredData={fredData} fredLoading={fredLoading} fredLastUpdated={fredLastUpdated} refreshFRED={refreshFRED} />
        <MainGrid
          quotes={quotes}
          quotesLoading={quotesLoading}
          fredData={fredData}
          fredLoading={fredLoading}
          fredLastUpdated={fredLastUpdated}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
