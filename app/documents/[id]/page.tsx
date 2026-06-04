import { Metadata } from 'next';
import { DocumentEditor } from '@/components/documents/document-editor';
import { SiteHeader } from '@/components/site-header';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: 'Edit Document | DraftDeckAI',
    description: 'Edit and improve your AI-generated document',
  };
}

export default async function DocumentPage({ params }: Props) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="min-h-[calc(100vh-4rem)]">
        <DocumentEditor documentId={id} />
      </main>
    </div>
  );
}
