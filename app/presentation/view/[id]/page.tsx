import { notFound } from 'next/navigation';
import { createServer } from '@/lib/supabase/server';
import { PresentationViewer } from '@/components/presentation/presentation-viewer';

interface PresentationViewPageProps {
  params: {
    id: string;
  };
}

export default async function PresentationViewPage({ params }: PresentationViewPageProps) {
  const supabase = createServer();
  const { id } = params;

  // Get the presentation
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('type', 'presentation')
    .single();

  if (error || !data) {
    notFound();
  }

  // Check if presentation is public or if user owns it
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user && user.id === data.user_id;
  const isPublic = data.content?.isPublic;

  if (!isPublic && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Private Presentation</h1>
          <p className="text-muted-foreground">This presentation is private and cannot be viewed.</p>
        </div>
      </div>
    );
  }

  const presentation = {
    id: data.id,
    title: data.title,
    slides: data.content.slides,
    template: data.content.template,
    prompt: data.prompt,
    isPublic: data.content.isPublic,
    createdAt: data.created_at,
    isOwner
  };

  return <PresentationViewer presentation={presentation} />;
}

export async function generateMetadata({ params }: PresentationViewPageProps) {
  const supabase = createServer();
  const { id } = params;

  const { data } = await supabase
    .from('documents')
    .select('title, content')
    .eq('id', id)
    .eq('type', 'presentation')
    .single();

  if (!data || !data.content?.isPublic) {
    return {
      title: 'Presentation - DocMagic',
    };
  }

  return {
    title: `${data.title} - DocMagic`,
    description: `View this presentation created with DocMagic`,
  };
}