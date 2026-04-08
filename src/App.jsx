import StickyHeader from './components/StickyHeader';

function App() {
  function handleRefreshAll() {
    // Will wire to panel refresh functions in later steps
  }

  return (
    <div className="min-h-screen bg-navy text-txt-primary font-sans">
      <StickyHeader onRefresh={handleRefreshAll} />

      {/* Main content area — panels go here in Steps 4+ */}
      <main className="p-4">
        <div className="rounded-lg bg-navy-panel border border-gold/20 p-8 text-center">
          <p className="text-txt-secondary text-sm">
            Step 2 complete — StickyHeader with NavBar, title bar, and live clock.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
