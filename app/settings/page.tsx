// 1. Rename the import to 'nextDynamic' so it doesn't clash!
import nextDynamic from 'next/dynamic';
import { Suspense } from 'react';

// 2. Use the renamed 'nextDynamic' function here
const SettingsClient = nextDynamic(() => import('./settings-client'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-3">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
        <span className="font-medium">Loading settings...</span>
      </div>
    </div>
  ),
});

// 3. Now this works perfectly because it's the ONLY thing named 'dynamic'
export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent"></div>
          <span className="font-medium">Loading your settings...</span>
        </div>
      </div>
    }>
      <SettingsClient />
    </Suspense>
  );
}