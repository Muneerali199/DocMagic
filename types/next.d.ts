// Type definitions for Next.js

// JSX types for React
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

// Global type declarations
interface Window {
  // Next.js data
  __NEXT_DATA__: any;
}

// Next.js specific types
declare module 'next' {
  // Define ReactNode type locally to avoid import
  type ReactNode = any;
  
  interface Metadata {
    title?: string;
    description?: string;
    alternates?: Record<string, any>;
    openGraph?: Record<string, any>;
    robots?: Record<string, any>;
    twitter?: Record<string, any>;
  }
  
  interface PageProps {
    params?: { [key: string]: string | string[] };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}
