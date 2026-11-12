'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

type BootstrapModule = typeof import('bootstrap');

declare global {
  interface Window {
    bootstrap?: BootstrapModule;
  }
}

let loading: Promise<BootstrapModule> | null = null;

/** Bootstrap's JavaScript (dropdowns, collapse, modals, carousel, toasts), loaded once in the browser. */
export function loadBootstrap(): Promise<BootstrapModule> {
  loading ??= import('bootstrap').then((bs) => {
    window.bootstrap = bs;
    return bs;
  });
  return loading;
}

/**
 * Bootstrap's data attributes (data-bs-toggle, …) work through listeners on
 * the document, so they keep working across client-side navigations. The
 * carousel's auto-play and the open mobile menu need a nudge on each page.
 */
export function BootstrapClient() {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    loadBootstrap().then((bs) => {
      if (cancelled) return;
      document.querySelectorAll<HTMLElement>('[data-bs-ride="carousel"]').forEach((el) => {
        bs.Carousel.getOrCreateInstance(el).cycle();
      });
      document.querySelectorAll<HTMLElement>('.navbar-collapse.show').forEach((el) => {
        bs.Collapse.getOrCreateInstance(el, { toggle: false }).hide();
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
