import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate } from '../../data/mockHelpers.js';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Badge, PageHeader } from '../../components/ui.jsx';

//M5 - Admin Dashboard
export default function AdminDashboard() {
  const { users, listings, requests, categories, getUser } = useApp();

  //Exclude admins from the user count
  const members = users.filter((user) => user.role !== 'admin');

  const stats = [
    ['Total users', members.length, '/admin/users'],
    ['Active listings', listings.filter((listing) => listing.status === 'available').length, '/admin/listings'],
    ['Suspended accounts', members.filter((user) => user.status === 'suspended').length, '/admin/users?status=suspended'],
    ['Categories', categories.length, '/admin/categories'],
  ];

  //Get the latest activity from users, listings, and requests
  const activity = [
    ...members.map((user) => ({
      date: user.createdAt,
      text: `New ${user.role === 'student' ? 'student' : 'organization'} account`,
      who: user.name,
      to: `/admin/users/${user.id}`,
    })),
    ...listings.map((listing) => ({
      date: listing.createdAt,
      text: `New listing: ${listing.name}`,
      who: getUser(listing.ownerId)?.name,
      to: `/admin/listings/${listing.id}`,
      status: listing.status === 'removed' ? 'removed' : null,
    })),
    ...requests.map((request) => ({
      date: request.createdAt,
      text: `${request.type === 'purchase' ? 'Purchase' : 'Donation'} request`,
      who: getUser(request.requesterId)?.name,
      status: request.status,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8);

  return (
    <SideLayout links={ADMIN_LINKS}>
      <PageHeader
        title="Welcome, Admin"
        subtitle="An overview of the Fayidh platform."
      />

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {stats.map(([label, value, to]) => (
          <Link
            key={label}
            to={to}
            className="card stat-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </Link>
        ))}
      </div>

      <h2 className="section-title">Recent activity</h2>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Activity</th>
              <th>User</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activity.length === 0 ? (
              <tr>
                <td colSpan={4}>No recent activity.</td>
              </tr>
            ) : (
              activity.map((item, i) => (
                <tr key={i}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    {item.to ? <Link to={item.to}>{item.text}</Link> : item.text}
                  </td>
                  <td>{item.who}</td>
                  <td>{item.status ? <Badge status={item.status} /> : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </SideLayout>
  );
}
