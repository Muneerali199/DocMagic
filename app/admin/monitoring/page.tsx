export default function AdminMonitoringPage() {
  const health = [
    { service: 'Database', status: 'Healthy', icon: '🟢' },
    { service: 'Auth', status: 'Healthy', icon: '🟢' },
    { service: 'Storage', status: 'Healthy', icon: '🟢' },
    { service: 'AI Generation', status: 'Healthy', icon: '🟢' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Monitoring</h1>

      <h2 className="text-lg font-semibold mb-3">Health Status</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {health.map((h) => (
          <div key={h.service} className="bg-white rounded-xl p-4 shadow">
            <div className="text-2xl mb-1">{h.icon}</div>
            <div className="font-semibold">{h.service}</div>
            <div className="text-sm text-gray-500">{h.status}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-3">API Usage Stats</h2>
      <div className="bg-white rounded-xl p-6 shadow mb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">—</div>
            <div className="text-sm text-gray-500">Requests Today</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">—</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">—</div>
            <div className="text-sm text-gray-500">Errors Today</div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Recent Error Logs</h2>
      <div className="bg-white rounded-xl p-6 shadow text-gray-400 text-sm">
        No recent errors logged.
      </div>
    </div>
  );
}
