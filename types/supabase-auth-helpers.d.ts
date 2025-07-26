// Type definitions for @supabase/auth-helpers-nextjs
declare module '@supabase/auth-helpers-nextjs' {
  import { SupabaseClient, User } from '@supabase/supabase-js';
  import { NextApiRequest, NextApiResponse, NextPageContext } from 'next';
  import { GetServerSidePropsContext } from 'next/types';
  import { CookieSerializeOptions } from 'cookie';

  export interface Session {
    user: User | null;
    accessToken: string | null;
  }

  export function createServerComponentClient(context?: {
    cookies?: () => { get: (name: string) => { value: string } | undefined };
  }): SupabaseClient;

  export function createRouteHandlerClient(context: {
    cookies: () => { get: (name: string) => { value: string } | undefined };
  }): SupabaseClient;

  export function createServerActionClient(context: {
    cookies: () => { get: (name: string) => { value: string } | undefined };
  }): SupabaseClient;

  export function createMiddlewareClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): SupabaseClient;

  export function createPagesBrowserClient(): SupabaseClient;

  export function createServerSupabaseClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): {
    supabaseClient: SupabaseClient;
    getSession: () => Promise<Session | null>;
  };

  export function createServerComponentSupabaseClient(context: {
    cookies: () => { get: (name: string) => { value: string } | undefined };
  }): {
    supabase: SupabaseClient;
    getSession: () => Promise<Session | null>;
  };

  export function createRouteHandlerSupabaseClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): {
    supabaseClient: SupabaseClient;
    getSession: () => Promise<Session | null>;
  };

  export function createMiddlewareSupabaseClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): {
    supabaseClient: SupabaseClient;
    getSession: () => Promise<Session | null>;
  };

  export function createPagesServerClient(context: GetServerSidePropsContext): SupabaseClient;

  export function createServerSupabaseClient(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): {
    supabaseClient: SupabaseClient;
    getSession: () => Promise<Session | null>;
  };

  export function getUser(context: {
    req: NextApiRequest;
    res: NextApiResponse;
  }): Promise<User | null>;

  export function withApiAuth(
    handler: (req: NextApiRequest, res: NextApiResponse, supabase: SupabaseClient) => Promise<void>
  ): (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

  export function withPageAuth({
    authRequired,
    redirectTo,
    getServerSideProps,
  }?: {
    authRequired?: boolean;
    redirectTo?: string;
    getServerSideProps?: (context: GetServerSidePropsContext, supabase: SupabaseClient) => Promise<{ props: any }>;
  }): (context: GetServerSidePropsContext) => Promise<{ props: any }>;

  export function withMiddlewareAuth({
    authRequired,
    redirectTo,
  }?: {
    authRequired?: boolean;
    redirectTo?: string;
  }): (req: NextApiRequest, res: NextApiResponse, next: () => void) => Promise<void>;

  export const supabaseServerClient: (context: GetServerSidePropsContext) => SupabaseClient;
  
  export const getServerSession: (context: GetServerSidePropsContext) => Promise<Session | null>;
}
