import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { dayMonthYear } from '@/lib/format';
import { addCard } from '@/server/actions/cards';
import { queryOne } from '@/server/db';
import { requireUser } from '@/server/session';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your GreenScore profile, certificates and sustainability progress.',
};

interface Profile {
  username: string;
  email: string;
  created_at: string;
  status: 'active' | 'inactive' | 'deactivated';
  company_name: string | null;
  contact_person: string | null;
  phone_number: string | null;
}

const statusButton = { active: 'btn-info', inactive: 'btn-warning', deactivated: 'btn-dark' } as const;

export default async function AccountPage() {
  const user = await requireUser();
  const profile = await queryOne<Profile>(
    `SELECT username, email, created_at, status, company_name, contact_person, phone_number
       FROM new_users WHERE id = ?`,
    [user.id],
  );
  if (!profile) redirect('/login');

  const details: Array<[string, string]> = [
    ['Username', profile.username],
    ['User ID', `EC2024/${user.id}`],
    ['Email', profile.email],
    ['Company', profile.company_name || '—'],
    ['Contact Person', profile.contact_person || '—'],
    ['Phone', profile.phone_number || '—'],
    ['Member Since', dayMonthYear(profile.created_at)],
  ];

  return (
    <PageShell className="page-account">
      <div className="container content-wrapper">
        <h1 className="text-white text-center display-5 mb-5">
          👤 My Profile — Welcome, <span className="text-success">{profile.username}</span>!
        </h1>

        <div className="row gy-4">
          <div className="col-md-6">
            <div className="card card-bg shadow-sm h-100">
              <div className="card-body">
                <h2 className="h5 card-title">Account Details</h2>
                <ul className="list-group list-group-flush">
                  {details.map(([label, value]) => (
                    <li className="list-group-item" key={label}>
                      <strong>{label}:</strong> {value}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card card-bg shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h2 className="h5 card-title">Actions</h2>
                <Link href="/impact" className="btn btn-success mb-3">
                  📈 View My Impact
                </Link>
                <Link href="/certificates" className="btn btn-success mb-3">
                  🏅 Certificate History
                </Link>
                <Link href="/calculator" className="btn btn-success mb-3">
                  🧮 Take Green Calculator
                </Link>
                <Link href="/community" className="btn btn-success mb-3">
                  🌱 Visit Community
                </Link>
                <button className={`btn ${statusButton[profile.status]} mt-auto`} disabled>
                  🔖 Status: {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                </button>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card card-bg shadow-sm">
              <div className="card-body">
                <h2 className="h5 card-title">💳 Add Credit Card</h2>
                <form action={addCard} className="row g-3">
                  <div className="col-12">
                    <p className="small text-muted mb-0">
                      Demo feature: only the last four digits are stored, and the security code is never asked for. Use
                      a test number such as 4111 1111 1111 1111.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="card_number">
                      Card Number
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="card_number"
                      id="card_number"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      maxLength={23}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="expiry_date">
                      Expiry (month)
                    </label>
                    <input type="month" className="form-control" name="expiry_date" id="expiry_date" autoComplete="cc-exp" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="card_name">
                      Cardholder Name
                    </label>
                    <input type="text" className="form-control" name="card_name" id="card_name" autoComplete="cc-name" maxLength={100} required />
                  </div>
                  <div className="col-md-6">
                    <button type="submit" className="btn btn-success w-100">
                      💾 Add Card
                    </button>
                  </div>
                  <div className="col-md-6">
                    <Link href="/account/cards" className="btn btn-outline-dark w-100">
                      📄 View Cards
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
