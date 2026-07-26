'use client';

import { useEffect } from 'react';

// Registers the static-asset service worker so the app is installable and
// loads faster on repeat visits. Silently no-ops on browsers without
// service worker support (e.g. some older Android WebViews).
export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Not fatal — the app works fine without the service worker.
      });
    }
  }, []);

  return null;
}
