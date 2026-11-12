import { readFlash } from '@/server/flash';
import { currentUser } from '@/server/session';
import { BackToTop } from './BackToTop';
import { FlashToast } from './FlashToast';
import { Footer } from './Footer';
import { Nav } from './Nav';

interface PageShellProps {
  children: React.ReactNode;
  /** Background photo in /public/assets/images. */
  background?: string;
  /** Strength of the dark overlay on the photo. */
  overlay?: 50 | 60;
  /** Page-specific class used to scope styles in pages.css. */
  className?: string;
}

/**
 * The frame shared by every page: skip link, navigation, main content,
 * footer, toast messages and the back-to-top button.
 */
export async function PageShell({ children, background = 'forest-hero.jpg', overlay = 50, className = '' }: PageShellProps) {
  const [user, message] = await Promise.all([currentUser(), readFlash()]);

  return (
    <div
      className={`page-shell bg-page overlay-${overlay} ${className}`.trim()}
      style={{ backgroundImage: `url('/assets/images/${background}')` }}
    >
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Nav user={user ? { username: user.username, role: user.role } : null} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <FlashToast flash={message} />
      <BackToTop />
    </div>
  );
}
