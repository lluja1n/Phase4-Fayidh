// M1 – Organization home after login (3.1.2: "Organization → dashboard").
// A short summary of both sides of the account: selling and buying.

import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate } from '../../data/mockHelpers.js';
import { Badge, PageHeader } from '../../components/ui.jsx';

export default function OrganizationDashboard() {
  const { currentUser, listings, requests, getListing, getUser } = useApp();
  const myListings = listings.filter((l) => l.ownerId === currentUser.id && l.status !== 'removed');
  const myListingIds = new Set(myListings.map((l) => l.id));
  const incoming = requests.filter((r) => myListingIds.has(r.listingId));
  const pendingIncoming = incoming.filter((r) => r.status === 'pending');
  const sent = requests.filter((r) => r.requesterId === currentUser.id);

  const stats = [
    ['Active listings', myListings.filter((l) => l.status === 'available').length, '/seller/listings', 'Manage listings'],
    ['Requests to review', pendingIncoming.length, '/seller/requests', 'Review requests'],
    ['Requests I sent', sent.length, '/my-requests', 'View my requests'],
  ];

  return (
    <div className="container page">
      <PageHeader
        title={`Welcome, ${currentUser.name}`}
        subtitle={currentUser.orgType === 'educational' ? 'Educational Institution · can sell, buy, and request donations' : 'Business · can sell and buy'}
        actions={
          <>
            <Link to="/browse" className="btn">
              Browse listings
            </Link>
            <Link to="/seller/listings/new" className="btn btn-primary">
              + Create Listing
            </Link>
          </>
        }
      />
      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        {stats.map(([label, value, to, link]) => (
          <div className="card stat-card" key={label}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <Link to={to}>{link} →</Link>
          </div>
        ))}
      </div>
      <h2 className="section-title">Latest requests on your listings</h2>
      {pendingIncoming.length === 0 ? (
        <p className="muted">No pending requests right now.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>From</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pendingIncoming.slice(0, 5).map((r) => (
                <tr key={r.id}>
                  <td>{getListing(r.listingId)?.name}</td>
                  <td>{getUser(r.requesterId)?.name}</td>
                  <td>{r.type === 'purchase' ? 'Purchase' : 'Donation'}</td>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>
                    <Badge status={r.status} />
                  </td>
                  <td>
                    <Link to={`/seller/requests/${r.id}`} className="btn btn-sm">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
