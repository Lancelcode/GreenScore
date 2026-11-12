import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';
import { requireUser } from '@/server/session';
import { CalculatorForm } from './CalculatorForm';

export const metadata: Metadata = {
  title: 'Green Calculator',
  description:
    'Complete the GreenScore sustainability assessment to receive a score, feedback and a certificate for your organisation.',
};

export default async function CalculatorPage() {
  await requireUser();

  return (
    <PageShell className="page-calculator">
      <div className="container mt-5 mb-5">
        <div className="card p-4 shadow-sm">
          <div className="row">
            <div className="col-md-8">
              <h1 className="text-success mb-4">🌿 Green Calculator</h1>
              <p className="lead">Evaluate your sustainability impact by selecting your practices below.</p>
              <CalculatorForm />
            </div>

            <div className="col-md-4">
              <div className="card shadow-sm p-3">
                <h2 className="h5 mb-3 text-center">Legend</h2>
                <ul className="list-unstyled mb-3">
                  <li>
                    🟢 <strong>Green</strong> = 10 points
                  </li>
                  <li>
                    🟠 <strong>Amber</strong> = 5 points
                  </li>
                  <li>
                    🔴 <strong>Red</strong> = 0 points
                  </li>
                </ul>
                <hr />
                <h3 className="h6 text-center mb-2">Awards:</h3>
                <ul className="list-unstyled text-center mb-0">
                  <li>🥇 Gold: 80–100 pts</li>
                  <li>🥈 Silver: 65–79 pts</li>
                  <li>🥉 Bronze: 51–64 pts</li>
                  <li>👏 Certificate: 0–50 pts</li>
                </ul>
              </div>
              <div className="card shadow-sm p-3 mt-4">
                <h2 className="h5 mb-3 text-center text-success">🌍 Ethical Reminder</h2>
                <p className="mb-0 text-center">
                  We encourage all companies to answer these questions truthfully. Honest reflection is the first step
                  toward meaningful change. 🌱🤝
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
