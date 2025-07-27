import { Metadata } from 'next';
import { AuthProvider } from '@/contexts/auth-context';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        {children}
      </div>
      <footer className="absolute bottom-4 text-center text-sm text-muted-foreground">
        DocMagic - Secure Document Management
      </footer>
    </div>
  );
}
