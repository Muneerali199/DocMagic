export default function AdminConfigPage() {
  const configs = [
    { key: 'Default Credits (New User)', value: '10' },
    { key: 'Max Documents Per User', value: '50' },
    { key: 'AI Generation Rate Limit', value: '20 / 5 min' },
    { key: 'Maintenance Mode', value: 'Off' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Configuration</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Setting</th>
              <th className="px-4 py-3 text-left">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {configs.map((c) => (
              <tr key={c.key} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.key}</td>
                <td className="px-4 py-3 text-gray-600">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 mt-4">
        Live config editing coming soon.
      </p>
    </div>
  );
}
