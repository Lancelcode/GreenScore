import type { Metadata } from 'next';
import { ErrorCard } from '@/components/ErrorCard';

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you were looking for could not be found.',
};

export default function NotFound() {
  return <ErrorCard code={404} />;
}
