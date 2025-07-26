'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { TemplateList } from "@/components/templates/template-list";
import { Template } from "@/types";
import { useToast } from "@/components/ui/use-toast";

export default function TemplatesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const supabase = createClient();
        
        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/auth/signin');
          return;
        }

        // Fetch both user's templates and public templates
        const [
          { data: userTemplates, error: userError },
          { data: publicTemplates, error: publicError }
        ] = await Promise.all([
          supabase
            .from('templates')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          
          // Get public templates from other users
          supabase
            .from('templates')
            .select('*')
            .eq('is_public', true)
            .neq('user_id', user.id)
            .order('created_at', { ascending: false })
        ]);

        if (userError || publicError) {
          throw userError || publicError;
        }

        // Combine and dedupe templates
        const allTemplates = [
          ...(userTemplates || []),
          ...((publicTemplates as Template[])?.filter((pt: Template) => 
            !userTemplates?.some((ut: Template) => ut.id === pt.id)
          ) || [])
        ] as Template[];

        setTemplates(allTemplates);
        setError(null);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load templates. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <TemplateList initialTemplates={templates} />
    </div>
  );
}
