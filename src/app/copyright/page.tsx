import type { Metadata } from 'next';
import { PageShell } from '@/components/PageShell';

export const metadata: Metadata = { title: 'Copyright' };

export default function CopyrightPage() {
  return (
    <PageShell overlay={60} className="page-legal">
      <div className="container py-5">
        <div className="card-bg p-4">
          <h1 className="mb-4">🌱 GreenScore Copyright</h1>
          <p>
            &copy; {new Date().getFullYear()} <strong>GreenScore</strong>. All rights reserved.
          </p>
          <p>
            All content on this website, including text, graphics, logos, icons, images, and software, is the property of
            GreenScore unless otherwise stated. Unauthorised use, reproduction, or distribution of any material without
            prior written permission is strictly prohibited.
          </p>
          <p>
            We support sharing for educational and environmental purposes. You are welcome to reference our material
            provided proper credit is given and a link to GreenScore is included.
          </p>
          <p>
            Questions? Contact us at:{' '}
            <a href="mailto:contact@greenscore.com" className="text-success">
              contact@greenscore.com
            </a>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
