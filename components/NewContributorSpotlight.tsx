// components/NewContributorSpotlight.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils'; // For tailwind-merge/clsx

interface NewContributor {
  id: string;
  name?: string;
  email: string;
  summary: string; // A short description of their contribution/status
}

export function NewContributorSpotlight() {
  const [newContributors, setNewContributors] = useState<NewContributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNewContributors() {
      try {
        const response = await fetch('/api/contributors/new'); // Call your new API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch new contributors');
        }
        const data: NewContributor[] = await response.json();
        setNewContributors(data);
      } catch (err) {
        console.error('Error fetching new contributors:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNewContributors();
  }, []);

  if (isLoading) {
    return null; // You could show a skeleton loader here
  }

  // Only render the section if there are new contributors to highlight
  if (newContributors.length === 0) {
    return null; 
  }

  return (
    <section className="py-12 px-4 relative z-10"> {/* Add relative z-10 for layering */}
      <div className="container mx-auto max-w-4xl text-center">
        {/* Header for the spotlight section */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-6 shimmer">
          <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
          <span className="text-sm font-medium">New Contributor Spotlight</span>
          <Sparkles className="h-4 w-4 text-blue-500" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-8 bolt-gradient-text">
          A Warm Welcome to Our Latest Magic Makers!
        </h2>
        
        {/* Grid to display new contributors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {newContributors.map((contributor) => (
            <Card key={contributor.id} className="professional-card p-4 flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-300 glass-effect border-blue-400/20">
              <Avatar className="h-16 w-16 ring-2 ring-blue-400/30">
                {/* Attempt to use GitHub avatar if name matches GitHub username pattern, or a default */}
                <AvatarImage src={`https://github.com/${contributor.name || contributor.email.split('@')[0]}.png`} alt={contributor.name || contributor.email} />
                <AvatarFallback className="bolt-gradient text-white font-bold text-lg">
                  {(contributor.name?.[0] || contributor.email?.[0] || 'U').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <p className="font-semibold bolt-gradient-text">{contributor.name || "Anonymous Contributor"}</p>
                <p className="text-sm text-muted-foreground">{contributor.summary}</p>
              </div>
            </Card>
          ))}
        </div>
        <Link href="/contribute" className="inline-block mt-8 text-blue-500 hover:underline text-sm">
          Want to see your name here? Learn how to contribute! →
        </Link>
      </div>
    </section>
  );
}