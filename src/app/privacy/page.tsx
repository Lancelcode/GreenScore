import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'GreenScore privacy policy — how we collect, use and protect your data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      sections={[
        {
          heading: 'Introduction',
          body: (
            <p>
              At <strong>GreenScore</strong>, we respect your privacy and are committed to protecting your personal data.
            </p>
          ),
        },
        {
          heading: '1. Information We Collect',
          body: (
            <ul>
              <li>
                <strong>Account Information:</strong> Name, email, company details.
              </li>
              <li>
                <strong>Usage Data:</strong> Dashboard interactions, emission reports.
              </li>
              <li>
                <strong>Payment Information:</strong> The last four digits, expiry month and cardholder name of any card
                you save. Full card numbers and security codes are never stored.
              </li>
            </ul>
          ),
        },
        {
          heading: '2. How We Use Your Data',
          body: (
            <ul>
              <li>Provide and improve our services.</li>
              <li>Manage your account and customer support.</li>
              <li>Process payments securely.</li>
              <li>Send important updates (you can opt out anytime).</li>
            </ul>
          ),
        },
        {
          heading: '3. Data Security',
          body: <p>We implement SSL encryption, secure servers, and regular audits to protect your information from unauthorised access.</p>,
        },
        {
          heading: '4. Your Rights',
          body: (
            <ul>
              <li>Access and update your personal data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Opt out of marketing communications.</li>
            </ul>
          ),
        },
        {
          heading: '5. Contact Us',
          body: (
            <p>
              Questions? <a href="mailto:privacy@greenscore.com">Contact us here</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
