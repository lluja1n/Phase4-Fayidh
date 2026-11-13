import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate } from '../../data/mockHelpers.js';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Alert, BackLink, Badge, ConfirmModal, EmptyState, InfoList, initials } from '../../components/ui.jsx';
import { accountTypeLabel, statusLabel } from './UserManagement.jsx';

//M5 - View account details, suspend and reactivate accounts (FR 3.4.2 - 3.4.4)
export default function UserDetails() {
  const { id } = useParams();
  const { getUser, listings, requests, setUserStatus, toast } = useApp();
  const [action, setAction] = useState(null);
  const user = getUser(id);

  if (!user || user.role === 'admin') {
    return (
      <SideLayout links={ADMIN_LINKS}>
        <BackLink to="/admin/users">Back to Users</BackLink>
        <EmptyState icon="!" title="Account not found" message="This account does not exist." />
      </SideLayout>
    );
  }

  const isOrg = user.role === 'organization';

  //Get this user's listings and requests
  const userListings = listings.filter((listing) => listing.ownerId === user.id);
  const userRequests = requests.filter((request) => request.requesterId === user.id);

  //Confirm the selected account action
  const confirm = () => {
    const current = getUser(id).status;

    if (action === 'suspend') {
      if (current === 'suspended') {
        toast('This account is already suspended.', 'error');
      } else {
        setUserStatus(id, 'suspended');
        toast('Account suspended.');
      }
    } else if (current === 'active') {
      toast('This account is already active.', 'error');
    } else {
      setUserStatus(id, 'active');
      toast('Account reactivated.');
    }

    setAction(null);
  };

  return (
    <SideLayout links={ADMIN_LINKS}>
      <BackLink to="/admin/users">Back to Users</BackLink>

      <div className="row-between" style={{ marginBottom: 20 }}>
        <div className="profile-head" style={{ margin: 0 }}>
          <div className={`avatar ${isOrg ? 'square' : ''}`}>
            {user.logo ? <img src={user.logo} alt="" /> : initials(user.name)}
          </div>
          <div>
            <h1 style={{ marginBottom: 4 }}>{user.name}</h1>
            <div className="row">
              <Badge status="neutral">{accountTypeLabel(user)}</Badge>
              <Badge status={user.status}>{statusLabel(user)}</Badge>
            </div>
          </div>
        </div>

        {user.status === 'active' && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setAction('suspend')}
          >
            Suspend Account
          </button>
        )}

        {user.status === 'suspended' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAction('reactivate')}
          >
            Reactivate Account
          </button>
        )}
      </div>

      {user.status === 'suspended' && (
        <Alert kind="warning">
          This account is suspended. The user cannot log in
          {isOrg ? ' and their listings are hidden from buyers' : ''}.
        </Alert>
      )}

      {user.status === 'pending' && (
        <Alert kind="info">
          This organization has not activated its email yet.
        </Alert>
      )}

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {isOrg ? 'Business account information' : 'Student information'}
          </h2>

          <InfoList
            rows={
              isOrg
                ? [
                    ['Organization', user.name],
                    ['Type', accountTypeLabel(user)],
                    ['Contact person', user.contactName],
                    ['Email', user.email],
                    ['Phone', user.phone],
                    ['City', user.city],
                    ['Address', user.address],
                    ['Description', user.description],
                    ['Joined', formatDate(user.createdAt)],
                  ]
                : [
                    ['Full name', user.name],
                    ['University', user.university],
                    ['University email', user.email],
                    ['Verification', user.verified ? 'Verified' : 'Not verified'],
                    ['Phone', user.phone],
                    ['Joined', formatDate(user.createdAt)],
                  ]
            }
          />
        </div>

        <div className="card">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Activity
          </h2>

          <InfoList
            rows={[
              [
                'Listings',
                isOrg
                  ? `${userListings.length} (${userListings.filter((listing) => listing.status === 'available').length} available)`
                  : 'Students cannot create listings',
              ],
              ['Requests sent', userRequests.length],
              [
                'Pending requests',
                userRequests.filter((request) => request.status === 'pending').length,
              ],
            ]}
          />

          {isOrg && userListings.length > 0 && (
            <ul className="small" style={{ paddingLeft: 18, marginTop: 12 }}>
              {userListings.map((listing) => (
                <li key={listing.id}>
                  <Link to={`/admin/listings/${listing.id}`}>
                    {listing.name}
                  </Link>{' '}
                  <Badge status={listing.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {action === 'suspend' && (
        <ConfirmModal
          title="Suspend this account?"
          message={`${user.name} will not be able to log in${isOrg ? ', and their listings will be hidden from buyers' : ''}. You can reactivate the account later.`}
          confirmLabel="Suspend Account"
          danger
          onConfirm={confirm}
          onCancel={() => setAction(null)}
        />
      )}

      {action === 'reactivate' && (
        <ConfirmModal
          title="Reactivate this account?"
          message={`${user.name} will be able to log in and use Fayidh again.`}
          confirmLabel="Reactivate Account"
          onConfirm={confirm}
          onCancel={() => setAction(null)}
        />
      )}
    </SideLayout>
  );
}
