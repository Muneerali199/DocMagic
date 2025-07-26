// app/api/contributors/new/route.ts
export const dynamic = 'force-dynamic'; // Ensures this route is dynamic and not cached
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server'; // Adjust import path if needed

export async function GET() {
  try {
    const supabase = createRoute();

    // Fetch up to 3 new contributors who have recently become active or registered
    // 'is_new_contributor' flag from the database migration
    const { data: newContributors, error } = await supabase
      .from('users')
      .select('id, email, user_metadata, created_at, total_documents_generated')
      .eq('is_new_contributor', true) // Filter for new contributors
      .order('created_at', { ascending: false }) // Order by most recent creation
      .limit(3); // Limit to a few for spotlight

    if (error) {
      console.error('Error fetching new contributors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch new contributors' },
        { status: 500 }
      );
    }

    interface UserMetadata {
        name?: string;
        [key: string]: any;
    }

    interface NewContributor {
        id: string;
        email: string;
        user_metadata?: UserMetadata;
        created_at: string;
        total_documents_generated: number;
    }

    interface FormattedContributor {
        id: string;
        name: string;
        email: string;
        summary: string;
    }

    const formattedNewContributors: FormattedContributor[] = (newContributors as NewContributor[]).map((contributor: NewContributor): FormattedContributor => ({
        id: contributor.id,
        name: contributor.user_metadata?.name || 'Anonymous User',
        email: contributor.email,
        summary: contributor.total_documents_generated > 0 
                            ? `Generated ${contributor.total_documents_generated} document${contributor.total_documents_generated > 1 ? 's' : ''}!` 
                            : 'Just joined the magic!',
    }));

    return NextResponse.json(formattedNewContributors);
  } catch (error) {
    console.error('Error in new contributors API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}