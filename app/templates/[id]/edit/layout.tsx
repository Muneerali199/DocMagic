import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Template | DocMagic',
  description: 'Edit your document template',
};

export default function EditTemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
