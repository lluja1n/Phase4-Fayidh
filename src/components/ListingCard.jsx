import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from './ui.jsx';
import { formatPrice } from '../data/mockHelpers.js';

export function ListingImage({ listing, showType = true, index = 0 }) {
  const src = listing.images?.[index];
  return (
    <div className="listing-image">
      {src ? (
        <img src={src} alt={listing.name} />
      ) : (
        <div className="listing-placeholder" role="img" aria-label={`No photo for ${listing.name}`}>
          <div>
            <div className="ph-initial">{listing.name.charAt(0).toUpperCase()}</div>
            <span className="small">No photo yet</span>
          </div>
        </div>
      )}
      {showType && <Badge status={listing.type} />}
    </div>
  );
}

export function ListingGallery({ listing }) {
  const [active, setActive] = useState(0);
  const images = listing.images || [];
  return (
    <div>
      <div className="gallery-main">
        <ListingImage listing={listing} index={active} />
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbs">
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => setActive(i)} aria-current={i === active} aria-label={`Show photo ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListingCard({ listing, category, owner, to }) {
  return (
    <article className="listing-card">
      <ListingImage listing={listing} />
      <div className="listing-card-body">
        <h3>{listing.name}</h3>
        <div className="meta">
          {category?.name || 'Uncategorized'} · {listing.condition} · {listing.location}
        </div>
        {owner && <div className="meta">By {owner.name}</div>}
        <div className="price">{listing.type === 'sale' ? formatPrice(listing.price) : 'Free – donation'}</div>
        <div className="meta">{listing.quantity} available</div>
        <Link to={to} className="btn btn-primary btn-sm" aria-label={`View details of ${listing.name}`}>
          View Details
        </Link>
      </div>
    </article>
  );
}
