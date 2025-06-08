'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@supabase/supabase-js';

export default function SettingsPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<User | null>(null);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserAndSubscription() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/sign-in');
        return;
      }

      setUser(user);

      const status = searchParams.get('status');
      if (status === 'success') {
        setSubscribed(true); // ✅ Manually update UI
        window.history.replaceState({}, document.title, window.location.pathname);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/stripe/check-subscription');
        if (res.ok) {
          const data = await res.json();
          setSubscribed(data.subscribed);
        } else {
          setSubscribed(false);
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setSubscribed(false);
      }

      setLoading(false);
    }

    fetchUserAndSubscription();
  }, [router, supabase, searchParams]);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const token = session?.access_token;

      if (!token || !user?.email) {
        console.error('No token or user email found');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: 'price_1RXdFgSJxJ4dBgIJP8ZxDEcO', // Replace with your Stripe price ID
          email: user.email,
          successUrl: `${window.location.origin}/?status=success`, // ✅ redirect to homepage
        }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = data.url;
      } else {
        console.error('Error response:', data.error);
        alert('Subscription failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Network or server error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManage = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          alert('Failed to create billing portal session');
        }
      } else {
        alert('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && user === null) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="mb-6">Welcome, {user?.email}</p>

      {subscribed ? (
        <button
          onClick={handleManage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Subscribe'}
        </button>
      )}
    </div>
  );
}
