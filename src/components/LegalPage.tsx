import Link from 'next/link';
import { PageShell } from './PageShell';

interface LegalPageProps {
  title: string;
  sections: Array<{ heading: string; body: React.ReactNode }>;
}

/** Shared layout for the privacy policy and terms pages. */
export function LegalPage({ title, sections }: LegalPageProps) {
  return (
    <PageShell className="page-legal">
      <div className="container content-wrapper">
        <h1 className="text-white text-center mb-4">{title}</h1>
        {sections.map((section) => (
          <div className="card card-bg shadow-sm p-4 mb-4" key={section.heading}>
            <h2 className="section-title mb-3">{section.heading}</h2>
            {section.body}
          </div>
        ))}
        <div className="text-center">
          <Link href="/account" className="btn btn-outline-light">
            ⬅ Back to My Profile
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
