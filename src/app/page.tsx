import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { LEVELS } from '@/lib/badges';
import { currentUser } from '@/server/session';

export const metadata: Metadata = {
  title: { absolute: 'Welcome to GreenScore' },
};

const features = [
  {
    icon: 'fa-leaf text-success',
    title: '🌍 Measure Your Impact',
    text: "Use our Green Calculator to evaluate your organisation's sustainability practices and discover areas for improvement.",
  },
  {
    icon: 'fa-medal text-warning',
    title: '🏅 Earn Recognition',
    text: 'Gain certification levels — Gold, Silver, Bronze — and download official digital certificates that show your commitment.',
  },
  {
    icon: 'fa-users text-primary',
    title: '🤝 Join the Green Community',
    text: "Connect with like-minded organisations, share tips, and contribute to a collective movement aligned with the UN's sustainability goals.",
  },
];

export default async function HomePage() {
  const user = await currentUser();

  return (
    <PageShell background="earth-bg.jpg" overlay={60} className="page-home">
      <div className="container content-wrapper text-center">
        <h1 className="text-white display-4 mb-4">🌿 Welcome to GreenScore</h1>
        <p className="text-white fs-5 mb-4">Track, reduce, and showcase your sustainability progress.</p>

        {!user && (
          <>
            <Link href="/register" className="btn btn-success btn-lg px-4 me-2">
              🌱 Join the Movement
            </Link>
            <Link href="/login" className="btn btn-outline-light btn-lg px-4">
              🔐 Member Login
            </Link>
          </>
        )}

        <div className="text-center mt-3">
          <Link href="/about" className="btn btn-light btn-sm px-4">
            🌍 Our Mission
          </Link>
        </div>

        <div className="mt-4 p-4 bg-light bg-opacity-75 rounded text-dark shadow fs-6">
          <p className="mb-3 fw-semibold">
            🌍 Earning the highest GreenScore badge is more than recognition — it&apos;s a verified contribution to
            planetary recovery.
          </p>
          <p className="mb-3">
            By reaching this level, your organisation actively safeguards over{' '}
            <strong>100 square metres of endangered rainforest</strong>, supporting biodiversity and protecting vital
            carbon sinks.
          </p>
          <p className="mb-3">
            For every <strong>£10,000</strong> raised through certified sustainability practices, <strong>£1,000</strong>{' '}
            is directly reinvested into global reforestation and carbon offset initiatives.
          </p>
          <p className="mb-0">
            GreenScore empowers responsible businesses to lead by example, aligning with the{' '}
            <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
              <em>United Nations Sustainable Development Goals</em>
            </a>
            .
          </p>
        </div>
      </div>

      <div className="container content-wrapper">
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {features.map((feature) => (
            <div className="col" key={feature.title}>
              <div className="card card-bg shadow-sm h-100 text-center p-4">
                <div className="icon-circle">
                  <i className={`fa ${feature.icon} fa-2x`} aria-hidden="true" />
                </div>
                <h2 className="h5">{feature.title}</h2>
                <p>{feature.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container content-wrapper">
        <h2 className="section-band text-center mb-4">🏆 GreenScore Badge Levels</h2>
        <div id="badgeCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
          <div className="carousel-inner">
            {LEVELS.map((badge, index) => (
              <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={badge.slug}>
                {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size local illustrations */}
                <img
                  src={`/assets/images/illustrations/${badge.slug}.jpg`}
                  className="d-block rounded shadow"
                  alt={badge.label}
                />
                <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded">
                  <h3 className="h5">{badge.label}</h3>
                </div>
              </div>
            ))}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#badgeCarousel" data-bs-slide="prev">
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" data-bs-target="#badgeCarousel" data-bs-slide="next">
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>
    </PageShell>
  );
}
