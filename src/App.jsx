import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-navy text-txt-primary">
      {/* Sticky Header placeholder */}
      <header className="sticky top-0 z-50 bg-navy border-b border-gold/30">
        <div className="px-4 py-2 text-xs text-txt-secondary border-b border-gold/10">
          <a href="/" className="text-gold hover:underline">HOME</a>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-wide text-gold">
            M&A INTELLIGENCE MONITOR
          </h1>
          <span className="text-sm text-txt-secondary">Empty Shell — Deploy Test</span>
        </div>
      </header>

      {/* Main content area — panels go here */}
      <main className="p-4">
        <div className="rounded-lg bg-navy-panel border border-gold/20 p-8 text-center">
          <p className="text-txt-secondary text-sm">
            Dashboard shell deployed successfully. Panels coming next.
          </p>
        </div>
      </main>
    </div>
  )
}

export default App
