import * as React from 'react';

// Simple spinner icon
export function Spinner({ className, ...props }: React.HTMLAttributes<SVGSVGElement>) {
  return (
    <svg
      className={`animate-spin ${className || 'h-4 w-4'}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// GitHub icon
export function GitHubIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

// Google icon
export function GoogleIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21.8 10.7c.2 1.1.2 2.3 0 3.4-1.5 7.6-10.2 10.4-15.9 5.7-1.2-1-2.2-2.3-2.8-3.8-1.9-4.2-.2-9.4 4-11.7 4.2-2.3 9.6-1.3 12.5 2.2l-3.4 3.3c-1.7-1.8-4.6-2-6.6-.4-2 1.6-2.3 4.5-.6 6.4 1.7 1.9 4.7 2.1 6.8.5.6-.5 1.1-1.1 1.4-1.8H12v-4.5h9.8z" />
    </svg>
  );
}

// Export all icons in an object for easier imports
export const Icons = {
  spinner: Spinner,
  gitHub: GitHubIcon,
  google: GoogleIcon,
};
