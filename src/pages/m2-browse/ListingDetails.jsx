import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate, formatPrice } from '../../data/mockHelpers.js';
import { ListingGallery } from '../../components/ListingCard.jsx';
import { Alert, BackLink, Badge, EmptyState, InfoList, Modal } from '../../components/ui.jsx';
import { eligibilityMessage, isPubliclyVisible, requestEligibility } from '../../utils/rules.js';

export default function ListingDetails() {
  const { id } = useParams();
  const { getListing, getCategory, getUser, users, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginRequired, setLoginRequired] = useState(false);
  const listing = getListing(id);
  const isOwner = listing && currentUser?.id === listing.ownerId;

  if (!listing || (!isPubliclyVisible(listing, users) && !isOwner)) {
    return (
      <div className="container page">
        <BackLink to="/browse">Back to Browse</BackLink>
        <EmptyState
          icon="!"
          title="This listing is no longer available."
          message="It may have been removed or all units have been given away."
          action={
            <Link to="/browse" className="btn btn-primary">
              Browse other listings
            </Link>
          }
        />
      </div>
    );
  }

  const owner = getUser(listing.ownerId);
  const { allowed, reason } = requestEligibility(currentUser, listing, users);
  const isDonation = listing.type === 'donation';
  const target = `/listings/${listing.id}/${isDonation ? 'donate' : 'purchase'}`;
  const message = reason && reason !== 'guest' ? eligibilityMessage(reason, listing.type) : '';

  const onRequest = () => {
    if (!currentUser) {
      setLoginRequired(true);
      return;
    }
    if (allowed) navigate(target);
  };

  return (
    <div className="container page">
      <BackLink to="/browse">Back to Browse</BackLink>
      <div className="details-layout">
        <ListingGallery listing={listing} />
        <div className="stack">
          <div>
            <div className="row" style={{ marginBottom: 8 }}>
              <Badge status={listing.type} />
              <span className="muted small">{getCategory(listing.categoryId)?.name}</span>
            </div>
            <h1>{listing.name}</h1>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: isDonation ? 'var(--donation)' : 'var(--text)' }}>
              {isDonation ? 'Free – donation' : `${formatPrice(listing.price)} / unit`}
            </div>
          </div>
          {listing.description && <p>{listing.description}</p>}
          <InfoList
            rows={[
              ['Available', `${listing.quantity} ${listing.quantity === 1 ? 'unit' : 'units'}`],
              ['Condition', listing.condition],
              ['Location', listing.location],
              ['Posted', formatDate(listing.createdAt)],
            ]}
          />

          <div className="card" style={{ padding: 18 }}>
            <div className="small muted">Listed by</div>
            <strong>{owner?.name}</strong>
            <div className="small muted">
              {owner?.orgType === 'educational' ? 'Educational Institution' : 'Business'} · {owner?.city}
            </div>
            <div className="small muted" style={{ marginTop: 6 }}>
              Contact details are shared after the seller accepts your request.
            </div>
          </div>

          {isOwner ? (
            <Alert kind="info">
              <p>
                This is your listing. <Link to={`/seller/listings/${listing.id}`}>Manage it in My Listings</Link>
              </p>
            </Alert>
          ) : (
            <div className="stack" style={{ gap: 8 }}>
              <button
                type="button"
                className={`btn btn-block ${isDonation ? 'btn-donation' : 'btn-primary'}`}
                onClick={onRequest}
                disabled={Boolean(currentUser) && !allowed}
                aria-describedby={message ? 'eligibility-msg' : undefined}
              >
                {isDonation ? 'Request Donation' : 'Request to Purchase'}
              </button>
              {!currentUser && <p className="small muted" style={{ margin: 0 }}>Log in to submit a request.</p>}
              {message && (
                <Alert kind="warning">
                  <p id="eligibility-msg">
                    {message}{' '}
                    {reason === 'unverified' && <Link to="/verify-student">Verify now</Link>}
                  </p>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>

      {loginRequired && (
        <Modal title="Log in required" onClose={() => setLoginRequired(false)}>
          <p className="muted">You need an account to {isDonation ? 'request a donation' : 'submit a purchase request'}. Log in or create a free account.</p>
          <div className="form-actions">
            <Link to="/signup" className="btn">
              Sign Up
            </Link>
            <Link to="/login" state={{ from: location.pathname }} className="btn btn-primary">
              Log In
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
}
