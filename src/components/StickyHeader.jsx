import NavBar from './NavBar';
import TitleBar from './TitleBar';

export default function StickyHeader({ onRefresh }) {
  return (
    <header className="sticky top-0 z-[1000]">
      <NavBar />
      <TitleBar onRefresh={onRefresh} />
      {/* MarketsBar and TickerTape will be added in Step 3 */}
    </header>
  );
}
