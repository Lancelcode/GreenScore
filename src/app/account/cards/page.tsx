import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/PageShell';
import { mask } from '@/lib/card';
import { isoMonth, monthYear } from '@/lib/format';
import { deleteCard, updateCard } from '@/server/actions/cards';
import { query } from '@/server/db';
import { requireUser } from '@/server/session';

export const metadata: Metadata = {
  title: 'View Credit Cards',
  description: 'Manage your saved credit cards on GreenScore.',
};

interface SavedCard {
  id: number;
  card_last4: string;
  expiry_date: string;
  cardholder_name: string;
}

export default async function CardsPage() {
  const user = await requireUser();
  const cards = await query<SavedCard>(
    'SELECT id, card_last4, expiry_date, cardholder_name FROM credit_cards WHERE user_id = ? ORDER BY id',
    [user.id],
  );

  return (
    <PageShell background="forest-money.jpg" className="page-cards">
      <div className="container content-wrapper">
        <h1 className="h2 text-white text-center mb-4">💳 Your Saved Credit Cards</h1>

        {cards.length > 0 ? (
          <div className="card card-bg shadow-sm p-4 mb-4">
            <div className="table-responsive">
              <table className="table table-striped align-middle mb-0">
                <thead className="table-success">
                  <tr>
                    <th scope="col">Card Number</th>
                    <th scope="col">Expiry</th>
                    <th scope="col">Cardholder</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id}>
                      <td>{mask(card.card_last4)}</td>
                      <td>{monthYear(card.expiry_date)}</td>
                      <td>{card.cardholder_name}</td>
                      <td className="text-nowrap">
                        <button className="btn btn-sm btn-danger" data-bs-toggle="modal" data-bs-target={`#delModal${card.id}`}>
                          🗑 Delete
                        </button>
                        <button className="btn btn-sm btn-warning ms-1" data-bs-toggle="modal" data-bs-target={`#editModal${card.id}`}>
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card card-bg shadow-sm p-5 text-center">
            <div style={{ fontSize: '3rem' }} aria-hidden="true">
              💳
            </div>
            <h2 className="h4 mt-3 mb-2">No saved cards yet</h2>
            <p className="text-muted mb-4">Add a credit card from your profile to use for contributions.</p>
            <Link href="/account" className="btn btn-success px-4">
              👤 Go to My Profile
            </Link>
          </div>
        )}

        <div className="mt-4 text-center">
          <Link href="/account" className="btn btn-outline-light">
            ⬅ Back to My Profile
          </Link>
        </div>
      </div>

      {cards.map((card) => (
        <div key={card.id}>
          <div className="modal fade" id={`delModal${card.id}`} tabIndex={-1} aria-labelledby={`delModalLabel${card.id}`} aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <form action={deleteCard}>
                  <input type="hidden" name="card_id" value={card.id} />
                  <div className="modal-header">
                    <h2 className="modal-title h5" id={`delModalLabel${card.id}`}>
                      Confirm Deletion
                    </h2>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    Are you sure you want to delete the card ending in <strong>{card.card_last4}</strong>?
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-danger" data-bs-dismiss="modal">
                      Yes, Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="modal fade" id={`editModal${card.id}`} tabIndex={-1} aria-labelledby={`editModalLabel${card.id}`} aria-hidden="true">
            <div className="modal-dialog">
              <div className="modal-content">
                <form action={updateCard}>
                  <input type="hidden" name="card_id" value={card.id} />
                  <div className="modal-header">
                    <h2 className="modal-title h5" id={`editModalLabel${card.id}`}>
                      Edit Card
                    </h2>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                  </div>
                  <div className="modal-body">
                    <p className="small text-muted">
                      Card ending <strong>{card.card_last4}</strong>. To change the number, delete this card and add a new one.
                    </p>
                    <div className="mb-3">
                      <label className="form-label" htmlFor={`expiry${card.id}`}>
                        Expiry (month)
                      </label>
                      <input
                        type="month"
                        className="form-control"
                        name="expiry_date"
                        id={`expiry${card.id}`}
                        defaultValue={isoMonth(card.expiry_date)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label" htmlFor={`holder${card.id}`}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="card_name"
                        id={`holder${card.id}`}
                        defaultValue={card.cardholder_name}
                        maxLength={100}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" data-bs-dismiss="modal">
                      💾 Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      ))}
    </PageShell>
  );
}
