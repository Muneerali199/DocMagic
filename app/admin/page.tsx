import { createServer } from '@/lib/supabase/server';

export default async function AdminOverviewPage() {
  const supabase = await createServer();

  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: docCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Total Users', value: userCount ?? 0, icon: '👥' },
    { label: 'Total Documents', value: docCount ?? 0, icon: '📄' },
    { label: 'Admin Panel', value: 'Active', icon: '🛡️' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 shadow">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
