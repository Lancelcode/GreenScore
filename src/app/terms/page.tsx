import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'GreenScore terms and conditions of use.',
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      sections={[
        {
          heading: '1. Acceptance of Terms',
          body: <p>By accessing or using GreenScore, you agree to be bound by these Terms and our Privacy Policy.</p>,
        },
        {
          heading: '2. Use of Service',
          body: (
            <ul>
              <li>You must provide accurate company information when registering.</li>
              <li>Do not misuse our services or upload harmful content.</li>
              <li>Respect intellectual property rights.</li>
            </ul>
          ),
        },
        {
          heading: '3. User Accounts',
          body: (
            <ul>
              <li>Keep your account credentials secure.</li>
              <li>Notify us immediately of any unauthorised account use.</li>
              <li>We reserve the right to suspend or terminate accounts.</li>
            </ul>
          ),
        },
        {
          heading: '4. GreenScore Points & Certifications',
          body: (
            <p>
              Points are awarded based on verified emission reductions. Certifications may be revoked if fraud or
              misrepresentation is detected.
            </p>
          ),
        },
        {
          heading: '5. Limitation of Liability',
          body: (
            <p>
              To the fullest extent permitted by law, GreenScore is not liable for indirect, incidental, or consequential
              damages.
            </p>
          ),
        },
        {
          heading: '6. Changes to Terms',
          body: <p>We may update these terms occasionally. Continued use after changes implies acceptance.</p>,
        },
      ]}
    />
  );
}
