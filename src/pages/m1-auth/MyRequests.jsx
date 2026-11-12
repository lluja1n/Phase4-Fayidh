// M1 – 3.3.6 View and Manage Submitted Requests (My Requests).
// Shows the user's own requests, filter by status, view details, cancel while Pending.

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate, formatPrice } from '../../data/mockHelpers.js';
import { canSeeContact } from '../../utils/rules.js';
import { Badge, ConfirmModal, EmptyState, InfoList, Modal, PageHeader } from '../../components/ui.jsx';

const FILTERS = ['all', 'pending', 'accepted', 'rejected', 'cancelled'];

export default function MyRequests() {
  const { currentUser, requests, getListing, getUser, cancelRequest, toast } = useApp();
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  const mine = useMemo(
    () => requests.filter((r) => r.requesterId === currentUser.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [requests, currentUser.id],
  );
  const shown = filter === 'all' ? mine : mine.filter((r) => r.status === filter);
  const selected = mine.find((r) => r.id === selectedId);

  const doCancel = () => {
    const result = cancelRequest(confirmId);
    toast(result.ok ? 'Request cancelled successfully.' : result.error, result.ok ? 'success' : 'error');
    setConfirmId(null);
  };

  return (
    <div className="container page">
      <PageHeader
        title="My Requests"
        subtitle="Track the purchase and donation requests you have sent."
        actions={
          <Link to="/browse" className="btn btn-primary">
            Browse listings
          </Link>
        }
      />

      {mine.length === 0 ? (
        <EmptyState
          icon="✉"
          title="No requests yet"
          message="You have not submitted any requests yet."
          action={
            <Link to="/browse" className="btn btn-primary">
              Browse listings
            </Link>
          }
        />
      ) : (
        <>
          <div className="filter-tabs" role="group" aria-label="Filter by status">
            {FILTERS.map((f) => (
              <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {f === 'all' ? `All (${mine.length})` : `${f[0].toUpperCase()}${f.slice(1)} (${mine.filter((r) => r.status === f).length})`}
              </button>
            ))}
          </div>
          {shown.length === 0 ? (
            <EmptyState title="No requests with this status" message="Try another filter." />
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => {
                    const listing = getListing(r.listingId);
                    return (
                      <tr key={r.id}>
                        <td>
                          <strong>{listing?.name || 'Deleted item'}</strong>
                          <div className="small muted">{getUser(listing?.ownerId)?.name}</div>
                        </td>
                        <td>{r.type === 'purchase' ? 'Purchase' : 'Donation'}</td>
                        <td>{r.quantity}</td>
                        <td>{formatDate(r.createdAt)}</td>
                        <td>
                          <Badge status={r.status} />
                        </td>
                        <td>
                          <div className="row" style={{ flexWrap: 'nowrap' }}>
                            <button type="button" className="btn btn-sm" onClick={() => setSelectedId(r.id)}>
                              View
                            </button>
                            {r.status === 'pending' && (
                              <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setConfirmId(r.id)}>
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {selected && (
        <RequestDetailsModal
          request={selected}
          listing={getListing(selected.listingId)}
          seller={getUser(getListing(selected.listingId)?.ownerId)}
          onClose={() => setSelectedId(null)}
          onCancel={() => {
            setSelectedId(null);
            setConfirmId(selected.id);
          }}
        />
      )}

      {confirmId && (
        <ConfirmModal
          title="Cancel this request?"
          message="The seller will no longer see this request. This cannot be undone."
          confirmLabel="Confirm Cancellation"
          cancelLabel="Keep Request"
          danger
          onConfirm={doCancel}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}

function RequestDetailsModal({ request, listing, seller, onClose, onCancel }) {
  return (
    <Modal title="Request details" onClose={onClose} wide>
      <div className="row" style={{ marginBottom: 12 }}>
        <Badge status={request.status} />
        <Badge status={request.type === 'purchase' ? 'sale' : 'donation'}>{request.type === 'purchase' ? 'Purchase request' : 'Donation request'}</Badge>
      </div>
      <InfoList
        rows={[
          ['Item', listing ? <Link to={`/listings/${listing.id}`}>{listing.name}</Link> : 'Deleted item'],
          ['Seller', seller?.name],
          ['Quantity', request.quantity],
          ['Price', request.type === 'purchase' && listing?.price ? `${formatPrice(listing.price)} each – total ${formatPrice(listing.price * request.quantity)}` : null],
          ['Purpose', request.type === 'donation' ? request.purpose : null],
          ['Submitted', formatDate(request.createdAt)],
          ['Seller reason', request.status === 'rejected' ? request.reason || 'No reason given' : null],
          ['Seller contact', canSeeContact(request) && seller ? `${seller.contactName} · ${seller.email} · ${seller.phone}` : null],
        ]}
      />
      {request.status === 'accepted' && <p className="small muted" style={{ marginTop: 12 }}>Contact the seller to arrange pick-up. Payment and delivery happen outside Fayidh.</p>}
      <div className="form-actions">
        {request.status === 'pending' && (
          <button type="button" className="btn btn-outline-danger" onClick={onCancel}>
            Cancel Request
          </button>
        )}
        <button type="button" className="btn btn-primary" onClick={onClose} data-close>
          Close
        </button>
      </div>
    </Modal>
  );
}
