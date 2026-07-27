'use client';

import { useEffect } from 'react';

// Registers the static-asset service worker so the app is installable and
// loads faster on repeat visits. Silently no-ops on browsers without
// service worker support (e.g. some older Android WebViews).
//
// Also actively self-heals against the classic PWA staleness trap: an
// already-installed app can sit open (or cached) across a deploy, hydrated
// against JS chunks that no longer exist on the server. Once a new service
// worker takes control, we force a one-time reload so the installed app
// always ends up on the current build instead of getting stuck broken.
export function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      // Ask the browser to check for a new sw.js right away rather than
      // waiting for its own update schedule.
      registration.update().catch(() => {});
    }).catch(() => {
      // Not fatal — the app works fine without the service worker.
    });
  }, []);

  return null;
}
