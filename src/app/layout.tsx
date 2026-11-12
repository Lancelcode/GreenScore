import type { Metadata, Viewport } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './globals.css';
import './pages.css';
import { BootstrapClient } from '@/components/BootstrapClient';

export const metadata: Metadata = {
  title: { default: 'GreenScore', template: '%s | GreenScore' },
  description:
    'GreenScore helps organisations measure, track and improve their environmental impact through a structured scoring and certification system.',
  icons: { icon: '/assets/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#198754',
};

// Applied before first paint so dark mode never flashes light.
const darkModeScript = `try{if(localStorage.getItem('greenscore-dark')==='on')document.body.classList.add('dark-mode')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* The dark-mode script may add a class to <body> before React hydrates. */}
      <body suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: darkModeScript }} />
        {children}
        <BootstrapClient />
      </body>
    </html>
  );
}
