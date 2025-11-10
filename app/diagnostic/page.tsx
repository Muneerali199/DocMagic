import { createClient } from '@/lib/supabase/client';

export default async function DiagnosticPage() {
  const supabase = createClient();

  // Check if tables exist by trying to query them
  let tablesStatus = {
    subscription_plans: false,
    user_subscriptions: false,
    payment_history: false,
    usage_tracking: false
  };

  let plansData: any[] = [];
  let errorMessage = '';

  try {
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*');
    
    if (!error && plans) {
      tablesStatus.subscription_plans = true;
      plansData = plans;
    }
  } catch (error: any) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h1 className="text-2xl font-bold mb-4">🔍 Payment System Diagnostic</h1>
          
          {/* Environment Variables Check */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Environment Variables</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? '✅' : '❌'}
                <span>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 20)}...</span>
              </div>
              <div className="flex items-center gap-2">
                {process.env.STRIPE_SECRET_KEY ? '✅' : '❌'}
                <span>STRIPE_SECRET_KEY: {process.env.STRIPE_SECRET_KEY ? 'Set (hidden)' : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2">
                {process.env.STRIPE_WEBHOOK_SECRET ? '✅' : '❌'}
                <span>STRIPE_WEBHOOK_SECRET: {process.env.STRIPE_WEBHOOK_SECRET ? 'Set (hidden)' : 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Database Tables Check */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Database Tables</h2>
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-4 mb-4">
                <p className="text-red-800 dark:text-red-200 font-semibold">Error:</p>
                <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">
                  This likely means the migration hasn't been run yet. Go to Supabase SQL Editor and run the migration.
                </p>
              </div>
            )}
            <div className="space-y-2">
              {Object.entries(tablesStatus).map(([table, exists]) => (
                <div key={table} className="flex items-center gap-2">
                  {exists ? '✅' : '❌'}
                  <span className="font-mono text-sm">{table}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Plans */}
          {plansData.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Subscription Plans ({plansData.length})</h2>
              <div className="space-y-3">
                {plansData.map((plan) => (
                  <div key={plan.id} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${plan.price}</p>
                        <p className="text-xs text-gray-500">{plan.billing_period}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <p className="font-mono text-gray-500">
                        Stripe ID: {plan.stripe_price_id}
                      </p>
                      {plan.stripe_price_id.startsWith('price_') && !plan.stripe_price_id.startsWith('price_individual') && !plan.stripe_price_id.startsWith('price_organization') ? (
                        <p className="text-green-600 dark:text-green-400">✅ Real Stripe Price ID</p>
                      ) : (
                        <p className="text-yellow-600 dark:text-yellow-400">⚠️ Placeholder - Update with real Stripe Price ID</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>If tables show ❌, run the migration in Supabase SQL Editor</li>
              <li>If Stripe Price IDs show ⚠️, update them in Stripe Dashboard and database</li>
              <li>Test the pricing page at <a href="/pricing" className="underline">/pricing</a></li>
              <li>Sign in and try subscribing with test card: 4242 4242 4242 4242</li>
            </ol>
          </div>

          {/* Quick Links */}
          <div className="mt-6 flex gap-3">
            <a 
              href="/pricing" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Go to Pricing
            </a>
            <a 
              href="/auth/signin" 
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Sign In
            </a>
            <a 
              href="https://dashboard.stripe.com/test/products" 
              target="_blank"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Stripe Dashboard
            </a>
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-3">📚 Documentation</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <a href="/PAYMENT_SETUP_CHECKLIST.md" className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <h3 className="font-semibold">Setup Checklist</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Step-by-step setup guide</p>
            </a>
            <a href="/PAYMENT_QUICK_START.md" className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <h3 className="font-semibold">Quick Start</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Quick reference guide</p>
            </a>
            <a href="/PAYMENT_FLOW_DIAGRAM.md" className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <h3 className="font-semibold">Flow Diagram</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Visual architecture</p>
            </a>
            <a href="/PAYMENT_IMPLEMENTATION_SUMMARY.md" className="p-3 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              <h3 className="font-semibold">Implementation Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete overview</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
