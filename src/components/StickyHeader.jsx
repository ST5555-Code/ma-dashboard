import NavBar from './NavBar';
import TitleBar from './TitleBar';
import MarketsBar from './MarketsBar';
import TickerTape from './TickerTape';

export default function StickyHeader({ quotes, loading, onRefresh }) {
  return (
    <header className="sticky top-0 z-[1000]">
      <NavBar />
      <TitleBar onRefresh={onRefresh} />
      <MarketsBar quotes={quotes} loading={loading} />
      <TickerTape quotes={quotes} loading={loading} />
    </header>
  );
}
