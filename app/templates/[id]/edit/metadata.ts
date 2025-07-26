import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: `Edit Template | DocMagic`,
    description: "Edit your document template",
  };
}
