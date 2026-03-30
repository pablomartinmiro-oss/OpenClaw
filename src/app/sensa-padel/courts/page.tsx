export default function CourtsPage() {
  const courts = [1, 2, 3, 4, 5, 6];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Courts</h1>
        <p className="text-gray-400 text-sm mt-1">Sensa Padel — 6 courts</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {courts.map((court) => (
          <div key={court} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-bold">Court {court}</div>
              <div className="w-3 h-3 rounded-full bg-green-400" title="Available" />
            </div>
            <div className="text-xs text-gray-400 mb-4">Available</div>
            <div className="h-24 bg-gray-800/50 rounded-lg flex items-center justify-center border border-dashed border-gray-700">
              <div className="text-center">
                <div className="text-2xl mb-1">🎾</div>
                <div className="text-xs text-gray-500">PlayByPoint integration coming soon</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold mb-2">PlayByPoint Integration</h2>
        <p className="text-gray-400 text-sm">
          Real-time court bookings will be pulled from PlayByPoint automatically once the integration is set up.
          For now, log court bookings manually via the Revenue Tracker.
        </p>
        <a href="/sensa-padel/revenue" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-sm font-medium transition-colors">
          → Go to Revenue Tracker
        </a>
      </div>
    </div>
  );
}
