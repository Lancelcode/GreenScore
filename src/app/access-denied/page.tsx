import type { Metadata } from 'next';
import { ErrorCard } from '@/components/ErrorCard';

export const metadata: Metadata = {
  title: '403 — Access Denied',
  description: 'You do not have permission to access this page.',
  robots: { index: false },
};

/** Shown with HTTP 403 by src/proxy.ts when a non-admin opens an admin page. */
export default function AccessDenied() {
  return <ErrorCard code={403} />;
}
