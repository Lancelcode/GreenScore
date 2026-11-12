'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/server/actions/auth';
import { DarkModeToggle } from './DarkModeToggle';

interface NavProps {
  user: { username: string; role: 'admin' | 'user' } | null;
}

interface MenuLink {
  href: string;
  label: string;
}

const tools: MenuLink[] = [
  { href: '/calculator', label: '🧮 Green Calculator' },
  { href: '/certificates', label: '📄 My Certificate History' },
  { href: '/impact', label: '📊 My Impact' },
];

const resources: MenuLink[] = [
  { href: '/partners', label: '🌱 Partners' },
  { href: '/resources', label: '🌿 Sustainability Info' },
  { href: '/about', label: 'ℹ️ About' },
  { href: '/privacy', label: '🔐 Privacy Policy' },
  { href: '/terms', label: '📜 Terms & Conditions' },
];

const admin: MenuLink[] = [
  { href: '/admin/feedback', label: '📝 Review User Feedback' },
  { href: '/admin/public-feedback', label: '🌍 Public Feedback Submissions' },
  { href: '/admin/users', label: '👥 Manage Users' },
];

function isCurrent(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Dropdown({ id, label, links, pathname }: { id: string; label: string; links: MenuLink[]; pathname: string }) {
  const sectionActive = links.some((link) => isCurrent(pathname, link.href));
  return (
    <li className="nav-item dropdown">
      <a
        className={`nav-link dropdown-toggle ${sectionActive ? 'nav-section-active' : ''}`}
        href="#"
        id={id}
        role="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {label}
      </a>
      <ul className="dropdown-menu" aria-labelledby={id}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className={`dropdown-item ${isCurrent(pathname, link.href) ? 'nav-active' : ''}`}
              href={link.href}
              aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const active = (href: string) => (isCurrent(pathname, href) ? 'nav-active' : '');

  return (
    <header className="sticky-top shadow">
      <nav className="navbar navbar-expand-lg navbar-dark px-3" aria-label="Main">
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" href="/">
            🏠 GreenScore
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <Dropdown id="toolsDropdown" label="🛠️ Tools" links={tools} pathname={pathname} />
              <Dropdown id="infoDropdown" label="📚 Resources" links={resources} pathname={pathname} />
              {user?.role === 'admin' && (
                <Dropdown id="adminDropdown" label="🛠 Admin Dashboard" links={admin} pathname={pathname} />
              )}
              <li className="nav-item">
                <Link className={`nav-link ${active('/feedback')}`} href="/feedback">
                  💬 Feedback
                </Link>
              </li>
              {user && (
                <li className="nav-item">
                  <Link className={`nav-link ${active('/account')}`} href="/account">
                    👤 Profile
                  </Link>
                </li>
              )}
            </ul>

            <ul className="navbar-nav mb-2 mb-lg-0 align-items-center gap-2">
              {user ? (
                <>
                  <li className="nav-item d-flex align-items-center text-light">
                    <span>
                      👋 Hello, <strong>{user.username}</strong>
                    </span>
                  </li>
                  <li className="nav-item">
                    <form action={logout} className="d-inline">
                      <button type="submit" className="btn btn-outline-light btn-sm">
                        Logout
                      </button>
                    </form>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className={`btn btn-outline-light btn-sm ${active('/login')}`} href="/login">
                      Login
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className={`btn btn-light btn-sm ${active('/register')}`} href="/register">
                      Register
                    </Link>
                  </li>
                </>
              )}
              <li className="nav-item">
                <DarkModeToggle />
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
