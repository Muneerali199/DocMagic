import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center gap-6">
        <span className="font-bold text-lg">🛡️ Admin Panel</span>
        <Link href="/admin" className="hover:underline text-sm">Overview</Link>
        <Link href="/admin/users" className="hover:underline text-sm">Users</Link>
        <Link href="/admin/monitoring" className="hover:underline text-sm">Monitoring</Link>
        <Link href="/admin/config" className="hover:underline text-sm">Config</Link>
        <Link href="/dashboard" className="ml-auto hover:underline text-sm">← Back to App</Link>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
