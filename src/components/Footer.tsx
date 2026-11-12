import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer text-white pt-5 pb-3 mt-auto">
      <div className="container">
        <div className="row gy-4">
          <div className="col-12 col-md-3">
            <h2 className="h4 fw-bold mb-2">🌱 GreenScore</h2>
            <p className="small mb-1">Building a Greener Future, Together.</p>
            <small className="d-block">
              &copy; {new Date().getFullYear()}{' '}
              <Link href="/copyright" className="text-white text-decoration-underline">
                GreenScore
              </Link>
              . All rights reserved.
            </small>
          </div>

          <div className="col-6 col-md-2">
            <h2 className="h6 text-uppercase fw-bold mb-3">Features</h2>
            <ul className="list-unstyled small">
              <li>
                <Link className="text-white" href="/calculator">
                  Green Calculator
                </Link>
              </li>
              <li>
                <Link className="text-white" href="/certificates">
                  Certificate
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h2 className="h6 text-uppercase fw-bold mb-3">Resources</h2>
            <ul className="list-unstyled small">
              <li>
                <Link className="text-white" href="/resources">
                  Guides &amp; Tips
                </Link>
              </li>
              <li>
                <a className="text-white" href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
                  UN SDGs
                </a>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h2 className="h6 text-uppercase fw-bold mb-3">Community</h2>
            <ul className="list-unstyled small">
              <li>
                <Link className="text-white" href="/community">
                  Community Board
                </Link>
              </li>
              <li>
                <Link className="text-white" href="/impact">
                  My Impact
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h2 className="h6 text-uppercase fw-bold mb-3">Legal</h2>
            <ul className="list-unstyled small">
              <li>
                <Link className="text-white" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="text-white" href="/terms">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-white mt-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <small className="text-white">Follow us:</small>
          <div>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none me-3">
              <i className="fab fa-facebook-f" aria-hidden="true" /> Facebook
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none me-3">
              <i className="fab fa-twitter" aria-hidden="true" /> Twitter
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none">
              <i className="fab fa-instagram" aria-hidden="true" /> Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
