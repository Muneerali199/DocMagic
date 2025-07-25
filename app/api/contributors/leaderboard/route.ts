// app/api/contributors/leaderboard/route.ts
export const dynamic = 'force-dynamic'; // Ensures this route is dynamic and not cached
export const runtime = 'nodejs'; // Specify Node.js runtime environment

import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server'; // Adjust this import if your createRoute path is different

export async function GET() {
  try {
    const supabase = createRoute();

    // Fetch top 10 contributors based on total_documents_generated
    // We select basic user info and the new contributor stats columns
    const { data: contributors, error } = await supabase
      .from('users') // Assuming stats are directly in the 'users' table
      .select('id, email, user_metadata, total_documents_generated, badges_earned')
      .order('total_documents_generated', { ascending: false }) // Order by contribution count
      .limit(10); // Limit to top 10

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    // Map the data to a cleaner format, extracting 'name' from user_metadata
    interface UserMetadata {
        name?: string;
        [key: string]: any;
    }

    interface Contributor {
        id: string;
        email: string;
        user_metadata?: UserMetadata;
        total_documents_generated: number;
        badges_earned?: string[];
    }

    interface FormattedContributor {
        id: string;
        name: string;
        email: string;
        total_documents_generated: number;
        badges_earned: string[];
    }

    const formattedContributors: FormattedContributor[] = (contributors as Contributor[]).map((contributor: Contributor): FormattedContributor => ({
        id: contributor.id,
        name: contributor.user_metadata?.name || 'Anonymous User', // Use name from metadata or default
        email: contributor.email,
        total_documents_generated: contributor.total_documents_generated,
        badges_earned: contributor.badges_earned || [], // Ensure it's an array
    }));

    return NextResponse.json(formattedContributors);
  } catch (error) {
    console.error('Error in leaderboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}