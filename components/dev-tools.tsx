'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useIsMounted } from '@/hooks/use-is-mounted';

export function DevTools() {
  const isMounted = useIsMounted();
  
  if (process.env.NODE_ENV !== 'development' || !isMounted) {
    return null;
  }

  return <ReactQueryDevtools initialIsOpen={false} />;
}
