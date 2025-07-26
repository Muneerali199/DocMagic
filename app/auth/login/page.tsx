import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome back
      </h1>
      <p className="text-sm text-muted-foreground">
        Enter your email and password to sign in to your account
      </p>
      
      <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-md" />}>
        <LoginForm />
      </Suspense>
      
      <p className="px-8 text-center text-sm text-muted-foreground">
        <Link
          href="/auth/forgot-password"
          className="hover:text-brand underline underline-offset-4"
        >
          Forgot your password?
        </Link>
      </p>
      
      <p className="px-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="hover:text-brand underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
