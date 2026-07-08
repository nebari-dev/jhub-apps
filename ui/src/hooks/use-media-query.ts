import * as React from 'react';

// Drop-in replacement for MUI's useMediaQuery during the MUI -> shadcn migration.
// SSR-safe: returns `false` when window is undefined.
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (typeof window === 'undefined') {
        return () => {};
      }
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query],
  );

  const getSnapshot = React.useCallback(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return React.useSyncExternalStore(subscribe, getSnapshot, () => false);
}
