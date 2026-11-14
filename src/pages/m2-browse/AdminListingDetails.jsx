import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { formatDate, formatPrice } from '../../data/mockHelpers.js';
import { ListingGallery } from '../../components/ListingCard.jsx';
import { ADMIN_LINKS, SideLayout } from '../../components/Layout.jsx';
import { Alert, BackLink, Badge, ConfirmModal, ErrorState, InfoList } from '../../components/ui.jsx';

export default function AdminListingDetails() {
  const { id } = useParams();
  const { getListing, getUser, getCategory, removeListing, toast } = useApp();
  const [confirming, setConfirming] = useState(false);
  const listing = getListing(id);

  if (!listing) {
    return (
      <SideLayout links={ADMIN_LINKS}>
        <BackLink to="/admin/listings">Back to All Listings</BackLink>
        <ErrorState message="Unable to load. Please try again." onRetry={() => window.location.reload()} />
      </SideLayout>
    );
  }

  const seller = getUser(listing.ownerId);
  const removed = listing.status === 'removed';

  const onRemove = () => {
    if (getListing(id)?.status === 'removed') {
      toast('This listing is no longer available.', 'error');
    } else {
      removeListing(id);
      toast('Listing removed successfully.');
    }
    setConfirming(false);
  };

  return (
    <SideLayout links={ADMIN_LINKS}>
      <BackLink to="/admin/listings">Back to All Listings</BackLink>
      <div className="row-between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{listing.name}</h1>
          <div className="row">
            <Badge status={listing.type} />
            <Badge status={listing.status} />
          </div>
        </div>
        {!removed && (
          <button type="button" className="btn btn-danger" onClick={() => setConfirming(true)}>
            Remove Listing
          </button>
        )}
      </div>
      {removed && <Alert kind="warning" className="mb">This listing was removed and is no longer visible to buyers.</Alert>}
      <div className="details-layout" style={{ marginTop: 16 }}>
        <ListingGallery listing={listing} />
        <div className="stack">
          <InfoList
            rows={[
              ['Category', getCategory(listing.categoryId)?.name || 'Uncategorized'],
              ['Quantity', listing.quantity],
              ['Condition', listing.condition],
              ['Location', listing.location],
              ['Price', listing.type === 'sale' ? formatPrice(listing.price) : 'Donation (free)'],
              ['Posted', formatDate(listing.createdAt)],
              ['Description', listing.description],
            ]}
          />
          <div className="card" style={{ padding: 18 }}>
            <div className="small muted">Seller</div>
            <strong>{seller?.name}</strong>
            <div className="small muted">
              {seller?.email} · <Badge status={seller?.status} />
            </div>
            <Link to={`/admin/users/${seller?.id}`} className="small">
              View seller account →
            </Link>
          </div>
        </div>
      </div>
      {confirming && (
        <ConfirmModal
          title="Remove this listing?"
          message={`"${listing.name}" will no longer be available to buyers. It stays visible here with a Removed status.`}
          confirmLabel="Remove Listing"
          danger
          onConfirm={onRemove}
          onCancel={() => setConfirming(false)}
        />
      )}
    </SideLayout>
  );
}
