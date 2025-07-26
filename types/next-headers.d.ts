// Type definitions for next/headers
declare module 'next/headers' {
  import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
  
  export function cookies(): ReadonlyRequestCookies;
  
  export function headers(): Headers;
  
  export function draftMode(): {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
  };
}
