import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { CONDITIONS } from '../../data/mockListings.js';
import { ListingCard } from '../../components/ListingCard.jsx';
import { EmptyState, PageHeader, SelectField, TextField } from '../../components/ui.jsx';
import { isPubliclyVisible } from '../../utils/rules.js';

const KEYS = ['q', 'category', 'type', 'condition', 'location'];

export default function BrowseListings() {
  const { listings, users, categories, getCategory, getUser, currentUser } = useApp();
  const [params, setParams] = useSearchParams();
  const f = Object.fromEntries(KEYS.map((k) => [k, params.get(k) || '']));

  const available = useMemo(() => listings.filter((l) => isPubliclyVisible(l, users)), [listings, users]);
  const locations = [...new Set(available.map((l) => l.location))].sort();

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return available
      .filter((l) => !q || l.name.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q))
      .filter((l) => !f.category || l.categoryId === f.category)
      .filter((l) => !f.type || l.type === f.type)
      .filter((l) => !f.condition || l.condition === f.condition)
      .filter((l) => !f.location || l.location === f.location)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [available, f.q, f.category, f.type, f.condition, f.location]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const hasFilters = KEYS.some((k) => f[k]);

  return (
    <div className="container page m2-browse">
      <PageHeader
        title="Browse Listings"
        subtitle={
          currentUser?.role === 'student' && !currentUser.verified
            ? 'You can browse and purchase items. Verify your university email to request donations.'
            : 'Find surplus materials and equipment for sale or donation.'
        }
      />
      <form className="toolbar card" style={{ padding: 16 }} role="search" onSubmit={(e) => e.preventDefault()}>
        <TextField className="search" label="Search" type="search" placeholder="Search by item name…" value={f.q} onChange={(e) => update('q', e.target.value)} />
        <SelectField label="Category" value={f.category} onChange={(e) => update('category', e.target.value)} placeholder="All categories" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        <SelectField
          label="Listing type"
          value={f.type}
          onChange={(e) => update('type', e.target.value)}
          placeholder="All types"
          options={[
            { value: 'sale', label: 'For Sale' },
            { value: 'donation', label: 'For Donation' },
          ]}
        />
        <SelectField label="Condition" value={f.condition} onChange={(e) => update('condition', e.target.value)} placeholder="Any condition" options={CONDITIONS.map((c) => ({ value: c, label: c }))} />
        <SelectField label="Location" value={f.location} onChange={(e) => update('location', e.target.value)} placeholder="All locations" options={locations.map((c) => ({ value: c, label: c }))} />
        <button type="button" className="btn" onClick={() => setParams({}, { replace: true })} disabled={!hasFilters}>
          Clear Filters
        </button>
      </form>

      <p className="muted small" aria-live="polite">
        Showing {results.length} {results.length === 1 ? 'listing' : 'listings'}
      </p>

      {available.length === 0 ? (
        <EmptyState title="No listings available" message="Check back soon." />
      ) : results.length === 0 ? (
        <EmptyState
          icon="?"
          title="No listings match your search."
          message="Try a different keyword or clear the filters."
          action={
            <button type="button" className="btn btn-primary" onClick={() => setParams({}, { replace: true })}>
              Clear Filters
            </button>
          }
        />
      ) : (
        <div className="listing-grid">
          {results.map((l) => (
            <ListingCard key={l.id} listing={l} category={getCategory(l.categoryId)} owner={getUser(l.ownerId)} to={`/listings/${l.id}`} />
          ))}
        </div>
      )}

      {/* Align dropdown arrows */}
      <style>{`
        .m2-browse .select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231f2937' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 44px;
        }
      `}</style>
    </div>
  );
}
