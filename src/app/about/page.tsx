/* eslint-disable @next/next/no-img-element -- local photos shown at their natural size */
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = {
  title: 'Why GreenScore?',
  description: 'Learn about GreenScore and how it helps organisations meet their sustainability goals.',
};

export default function AboutPage() {
  return (
    <PageShell className="page-about">
      <div className="container content-wrapper">
        <div className="card card-bg mb-5 text-center p-4">
          <h1 className="text-success mb-3">💼 Why GreenScore?</h1>
          <p className="lead">Empowering organisations to measure, track, and improve sustainability efforts.</p>
        </div>

        <div className="row gy-5">
          <div className="col-lg-12">
            <div className="card card-bg p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <img src="/assets/images/earth-hands.jpg" alt="Sustainable Responsibility" className="img-fluid mb-3 mb-md-0 w-100" />
                </div>
                <div className="col-md-6">
                  <h2 className="section-title">🌍 Purpose-Built for Corporate Sustainability</h2>
                  <p>
                    GreenScore is designed to support educational institutions, businesses, and public organisations in
                    meeting their environmental responsibilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="card card-bg p-4">
              <div className="row align-items-center">
                <div className="col-md-6 order-md-2">
                  <img src="/assets/images/team-green.jpg" alt="Collaborative Sustainability" className="img-fluid mb-3 mb-md-0 w-100" />
                </div>
                <div className="col-md-6 order-md-1">
                  <h2 className="section-title">📈 Track, Learn, Grow</h2>
                  <p>
                    With GreenScore, your organisation can quantify environmental efforts, set benchmarks, and receive
                    recognition through a point-based certification model.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-12">
            <div className="card card-bg p-4">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <img src="/assets/images/sdg.jpg" alt="Sustainable Development Goals" className="img-fluid mb-3 mb-md-0 w-100" />
                </div>
                <div className="col-md-6">
                  <h2 className="section-title">📚 Backed by Global Goals</h2>
                  <p>
                    GreenScore is inspired by the{' '}
                    <a href="https://sdgs.un.org/goals" target="_blank" rel="noopener noreferrer">
                      UN Sustainable Development Goals
                    </a>{' '}
                    and the core pillars of sustainability as outlined by <strong>UNESCO</strong>.
                  </p>
                  <ul>
                    <li>
                      <strong>🌿 Environmental Sustainability</strong>
                    </li>
                    <li>
                      <strong>💼 Economic Sustainability</strong>
                    </li>
                    <li>
                      <strong>🤝 Social Sustainability</strong>
                    </li>
                    <li>
                      <strong>🎭 Cultural Sustainability</strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 text-center">
            <div className="card card-bg p-4">
              <h2 className="text-success mb-3">🚀 Start Your Green Transformation</h2>
              <p>
                Whether you&apos;re a college campus, a non-profit, or a forward-thinking enterprise, GreenScore provides a
                practical and engaging way to take environmental action. 🌿
              </p>
              <div>
                <Link href="/calculator" className="btn btn-success mt-3 px-4">
                  Begin Assessment
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
