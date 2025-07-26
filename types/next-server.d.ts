// Type definitions for next/server
declare module 'next/server' {
  import { IncomingMessage, ServerResponse } from 'http';
  import { Readable } from 'stream';
  import { UrlWithParsedQuery } from 'url';

  // Define interfaces instead of importing to avoid circular dependencies
  interface NextRequest extends Request {
    nextUrl: URL;
    cookies: {
      get: (name: string) => { name: string; value: string } | undefined;
      getAll: () => { name: string; value: string }[];
      set: (name: string, value: string, options?: any) => void;
      delete: (name: string) => void;
    };
    geo?: {
      city?: string;
      country?: string;
      region?: string;
      latitude?: string;
      longitude?: string;
    };
    ip?: string;
    ua?: string;
  }

  interface NextResponse extends Response {}
  interface NextApiRequest extends IncomingMessage {}
  interface NextApiResponse extends ServerResponse {}

  export { NextRequest, NextResponse, NextApiRequest, NextApiResponse };

  export interface NextRequestInit extends RequestInit {
    nextConfig?: {
      basePath?: string;
      i18n?: {
        locales?: string[];
        defaultLocale?: string;
      };
      trailingSlash?: boolean;
    };
  }

  export interface NextFetchEvent extends Event {
    readonly request: NextRequest;
    respondWith(response: Response | Promise<Response>): void;
  }

  export interface NextMiddleware {
    (request: NextRequest, event: NextFetchEvent): NextResponse | Promise<NextResponse | void> | void;
  }

  export interface MiddlewareResponse extends Response {
    request: {
      nextUrl: URL;
      cookies: {
        get: (name: string) => { name: string; value: string } | undefined;
        getAll: () => { name: string; value: string }[];
        set: (name: string, value: string, options?: any) => void;
        delete: (name: string) => void;
      };
      geo?: {
        city?: string;
        country?: string;
        region?: string;
        latitude?: string;
        longitude?: string;
      };
      ip?: string;
      ua?: string;
    };
  }

  export function userAgentFromString(uaString: string | null): {
    ua: string;
    browser: {
      name?: string;
      version?: string;
    };
    device: {
      model?: string;
      type?: string;
      vendor?: string;
    };
    os: {
      name?: string;
      version?: string;
    };
  };

  export function userAgent(request: Request): ReturnType<typeof userAgentFromString>;

  export function isBot(userAgent: string): boolean;

  export function detectBotUserAgent(userAgent: string): boolean;

  export function detectDeviceType(userAgent: string): 'mobile' | 'tablet' | 'smarttv' | 'console' | 'embedded' | 'wearable' | 'desktop';

  export function detectOS(userAgent: string): string;

  export function detectBrowser(userAgent: string): string;

  export function detectDevice(userAgent: string): string;

  export function detectEngine(userAgent: string): string;

  export function detectOSVersion(userAgent: string): string;

  export function detectBrowserVersion(userAgent: string): string;

  export function detectDeviceVersion(userAgent: string): string;

  export function detectEngineVersion(userAgent: string): string;
}
