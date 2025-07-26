// app/leaderboard/page.tsx
'use client'; // This is a client-side component

import { useState, useEffect } from 'react';
import { SiteHeader } from "@/components/site-header"; // Assuming SiteHeader for global navigation
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Sparkles, User as UserIcon, FileText, Lightbulb } from 'lucide-react'; // Add necessary icons
import { cn } from '@/lib/utils'; // For tailwind-merge and clsx utilities

// Define the interface for a contributor, matching API response
interface Contributor {
  id: string;
  name?: string; 
  email: string;
  total_documents_generated: number;
  badges_earned?: string[]; // Array of badge keys
}

export default function LeaderboardPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch('/api/contributors/leaderboard'); // Call your new API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data: Contributor[] = await response.json();
        setContributors(data);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  // Define some example badge data for mapping (must match keys stored in DB)
  const allPossibleBadges = {
    'first-contribution': { name: 'Newbie', icon: <Sparkles className="h-3 w-3 mr-1" />, colorClass: 'bg-blue-500' },
    'top-editor': { name: 'Top Editor', icon: <Trophy className="h-3 w-3 mr-1" />, colorClass: 'bg-yellow-500' },
    '100-docs-club': { name: 'Power User', icon: <FileText className="h-3 w-3 mr-1" />, colorClass: 'bg-green-500' },
    'feature-suggester': { name: 'Innovator', icon: <Lightbulb className="h-3 w-3 mr-1" />, colorClass: 'bg-purple-500' },
    // Add more badge definitions here
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background elements matching your main design */}
      <div className="absolute inset-0 mesh-gradient opacity-20"></div>
      <div className="floating-orb w-32 h-32 sm:w-48 sm:h-48 bolt-gradient opacity-15 top-20 -left-24"></div>
      <div className="floating-orb w-24 h-24 sm:w-36 sm:h-36 bolt-gradient opacity-20 bottom-20 -right-18"></div>
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23000000' fill-opacity='1'%3e%3ccircle cx='30' cy='30' r='1'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
        }}
      />

      <SiteHeader /> {/* Your global navigation header */}
      <main className="flex-1 relative z-10">
        <div className="container py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          {/* Header for the Leaderboard Page */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect mb-4">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Community Ranking</span>
              <Sparkles className="h-4 w-4 text-blue-500" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Top <span className="bolt-gradient-text">DocMagic</span> Contributors
            </h1>
            <p className="text-muted-foreground">
              Celebrating the individuals driving innovation and magic on our platform.
            </p>
          </div>

          <Card className="glass-effect border-yellow-400/20 relative overflow-hidden">
            <div className="absolute inset-0 shimmer opacity-20"></div> {/* Visual effect */}
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 bolt-gradient-text" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
                  <span className="ml-3 text-lg text-muted-foreground">Loading leaderboard...</span>
                </div>
              ) : error ? (
                <div className="text-center p-8 text-red-500">
                  <p>Error: {error}</p>
                  <p>Could not load leaderboard data. Please try again later.</p>
                </div>
              ) : contributors.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  <p>No contributors yet. Be the first to make magic!</p>
                </div>
              ) : (
                <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Contributor</TableHead>
                        <TableHead>Documents Created</TableHead>
                        <TableHead>Badges</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contributors.map((contributor, index) => (
                        <TableRow key={contributor.id}>
                          <TableCell className="font-bold text-lg text-yellow-500">#{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {/* Try to use GitHub avatar if name matches GitHub username pattern */}
                                <AvatarImage src={`https://github.com/${contributor.name || contributor.email.split('@')[0]}.png`} alt={contributor.name || contributor.email} />
                                <AvatarFallback className="bolt-gradient text-white text-sm">
                                  {(contributor.name?.[0] || contributor.email?.[0] || 'U').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{contributor.name || contributor.email}</p>
                                {/* Only show email as sub-text if a proper name is available */}
                                {contributor.name && <p className="text-xs text-muted-foreground">{contributor.email}</p>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{contributor.total_documents_generated}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {(contributor.badges_earned || []).map((badgeKey) => {
                                const badgeInfo = allPossibleBadges[badgeKey as keyof typeof allPossibleBadges];
                                return badgeInfo ? (
                                  <Badge 
                                    key={badgeKey} 
                                    className={cn("text-white", badgeInfo.colorClass)}
                                  >
                                    {badgeInfo.icon}
                                    {badgeInfo.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}