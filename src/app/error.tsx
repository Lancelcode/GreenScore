'use client';

/**
 * Shown when a page fails to render — most often because the database is
 * still starting or unreachable. Details go to the server log, never to the
 * visitor.
 */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell bg-page overlay-60 page-error" style={{ backgroundImage: "url('/assets/images/forest-hero.jpg')" }}>
      <main id="main" tabIndex={-1}>
        <div className="error-page">
          <div className="error-card">
            <div className="error-emoji mb-3" aria-hidden="true">
              🌧️
            </div>
            <h1 className="h3 text-success fw-bold mb-2">Temporarily unavailable</h1>
            <p className="text-muted mb-4">Sorry, GreenScore is temporarily unavailable. Please try again shortly.</p>
            <div className="d-flex flex-column gap-2">
              <button type="button" className="btn btn-success" onClick={reset}>
                🔄 Try again
              </button>
              {/* A full page load, in case the problem was with client-side navigation. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" className="btn btn-outline-secondary">
                🏠 Go to Home
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
